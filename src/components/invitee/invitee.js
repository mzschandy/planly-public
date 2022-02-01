/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import Cookies from 'js-cookie';
import {
  Form, Button, Alert, Row, Col, ListGroup,
} from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';

/**
 * Class representing the Dashboard once user logs in.
 * @extends Component
 */
import '../layout/dashboard/dashboard.css';

async function postData(url = '', data2 = {}) {
  // Default options are marked with *
  const csrftoken = Cookies.get('csrftoken');
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      Authorization: `JWT ${localStorage.getItem('token')}`,
      'X-CSRFToken': csrftoken,
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
    body: JSON.stringify(data2), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

class Invitee extends Component {
  /**
   * Create an Invitee component
   * @param {string} email - State variable to hold email typed in by user
   * @param {string[]} emailList - Array of email addresses to be invited to event
   * @param {boolean} isOpen - Boolean if the modal is currently open
   * @param {string} incomplete_alert - Description of error if any required fields are missing
   * @param {string} eventId - ID of event users are being invited to - passed to back-end
   * @param {ListGroup.Item[]} tableRows - ListGroup table showing emails that are being invited
   * @param {boolean} currUserIsOwner - Boolean if current user has owner privileges on current page
   */
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      emailList: [],
      isOpen: false,
      incomplete_alert: null,
      eventId: props.eventId,
      tableRows: [],
      currUserIsOwner: this.props.currentUserIsOwner,
    };
    this.handleAdd = this.handleAdd.bind(this);
    this.handleInput = this.handleInput.bind(this);
    this.handleSendInvitee = this.handleSendInvitee.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  // componentDidMount() {
  //   fetch('/core/current_user/', {
  //     headers: {
  //       Authorization: `JWT ${localStorage.getItem('token')}`,
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((json) => {
  //       console.log(json);
  //     });
  // }

  /**
   * Process user updates to email text field
  */
  handleInput(e) {
    this.setState({
      incomplete_alert: '',
      email: e.target.value,
    });
  }

  /**
   * Handle user clicking of "Add" button
  */
  async handleAdd(event) {
    event.preventDefault();
    const checkEmail = this.state.email;
    if (checkEmail.trim().length === 0) {
      this.setState({
        incomplete_alert: 'Email is a required field.',
        email: '',
      });
    } else {
      const so = await postData('/api/eventinvitee/validate/', {
        email: checkEmail,
        eventId: this.state.eventId,
      });
      if (so.status !== '1') {
        this.setState({ incomplete_alert: so.body });
      } else if (this.state.emailList.indexOf(checkEmail) === -1) {
        this.setState((state) => ({ emailList: state.emailList.concat(checkEmail) }));
        this.state.tableRows.push(
          <ListGroup.Item id={checkEmail}>
            <Row>
              <Col>{checkEmail}</Col>
              <Col>
                <Button variant="outline-dark" onClick={() => this.handleRemove(checkEmail)}>X</Button>
              </Col>
            </Row>
          </ListGroup.Item>,
        );
        this.setState({ email: '' });
      } else {
        this.setState({ incomplete_alert: 'Email has already been added for an invitation.' });
      }
    }
  }

  /**
   * Handle user removing a previously-added email from the list
  */
  handleRemove(email) {
    console.log(`attempting to remove ${email}`);
    const a = [...this.state.tableRows];
    const e = [...this.state.emailList];
    let j;
    for (j = 0; j < this.state.tableRows.length; j += 1) {
      const row = this.state.tableRows[j];
      if (row.props.id === email) {
        const i = this.state.emailList.indexOf(email);
        if (i > -1) {
          e.splice(i, 1);
        }
        a.splice(j, 1);
        this.setState({
          tableRows: a,
          emailList: e,
        });
      }
    }
  }

  /**
   * Submit entire modal form to back-end for invites to be sent out
  */
  async handleSendInvitee() {
    if (this.state.emailList.length === 0) {
      this.setState({ incomplete_alert: 'Please specify at least one email address to add.' });
    } else {
      const so = await postData('/api/eventinvitee/', {
        emails: this.state.emailList,
        eventId: this.state.eventId,
      });
      if (so.status === '1') {
        console.log(so);
        if (so.body.already_invited.length === 0 && so.body.does_not_exist.length === 0) {
          this.closeModal();
          this.props.doneFunction();
        } else {
          console.log(`Already invited: ${so.body.already_invited.length}`);
          console.log(`Does not exist: ${so.body.does_not_exist.length}`);
        }
      }
    }
  }

  /**
   * Handle opening of the modal
  */
  openModal = () => { this.setState({ isOpen: true }); }

  /**
   * Handle closing of the modal and reset state
  */
  closeModal = () => {
    this.setState({
      isOpen: false,
      emailList: [],
      tableRows: [],
      email: '',
    });
  }

  render() {
    return (
      <div>
        <Button onClick={this.openModal}>
          <i className="fa fa-user-plus" />
          Add Invitee
        </Button>
        <div id="content-header2">
          <div id="content-header">
            <div className="modal-area">
              <Modal show={this.state.isOpen} onHide={this.closeModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Add Guests</Modal.Title>
                </Modal.Header>
                {this.state.incomplete_alert ? <Alert variant="danger">{this.state.incomplete_alert}</Alert> : null}
                <Modal.Body>
                  <Form>
                    <Form.Group>
                      <Row>
                        <Col md="auto">
                          <Form.Label>Email</Form.Label>
                          <input type="text" id="invitee_input" value={this.state.email} onChange={this.handleInput} />
                        </Col>
                        <Col>
                          <Button variant="primary" onClick={this.handleAdd}>
                            Add
                          </Button>
                        </Col>
                      </Row>
                    </Form.Group>
                    {/* <input type="submit" className="btn btn-primary" value="submit" /> */}
                  </Form>
                  <ListGroup>
                    {this.state.tableRows}
                  </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={this.closeModal}>
                    Close
                  </Button>
                  <Button id="Btn_check" variant="primary" onClick={this.handleSendInvitee}>
                    Send Invitee
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Invitee;
