import React, { Component } from 'react';
import Cookies from 'js-cookie';
import {
  Modal, Form, Alert, Button,
} from 'react-bootstrap';
import moment from 'moment';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEdit } from '@fortawesome/free-solid-svg-icons';

async function httpReq(url = '', data2 = {}, verb) {
  // Default options are marked with *
  const csrftoken = Cookies.get('csrftoken');
  const response = await fetch(url, {
    method: verb, // *GET, POST, PUT, DELETE, etc.
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

// async function postData(url = '', data2 = {}) {
//   // Default options are marked with *
//   const csrftoken = Cookies.get('csrftoken');
//   console.log(data2);
//   const response = await fetch(url, {
//     method: 'POST', // *GET, POST, PUT, DELETE, etc.
//     headers: {
//       Authorization: `JWT ${localStorage.getItem('token')}`,
//       'X-CSRFToken': csrftoken,
//       'Content-Type': 'application/json',
//     },
//     credentials: 'same-origin',
//     body: JSON.stringify(data2), // body data type must match "Content-Type" header
//   });
//   return response.json(); // parses JSON response into native JavaScript objects
// }

/**
 * Modal form that can be used to add or edit an event.
 * @extends Component
 */
class EventForm extends Component {
  /**
   * Create a Dashboard
   * @param {string} name - State variable tied to name field of form
   * @param {string} detail - State variable tied to detail/description field of form
   * @param {boolean} isOpen - Boolean if the modal is open or closed
   * @param {object} event_form_data - object of event fields to pre-fill form with
   * @param {string} incomplete_alert - alert to show if a required field is missing
   * @param {int} user_id - ID of user submitting the form (required by back-end)
   * @param {boolean} edit_mode - Indicator if form is in create or edit mode
   */
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      detail: '',
      isOpen: false,
      event_form_data: props.event ? props.event : {},
      incomplete_alert: null,
      user_id: this.props.userId,
      edit_mode: this.props.event !== undefined,
    };
    // console.log(this.state);
    // this.handleNameChange = this.handleNameChange.bind(this);
    // this.handleDetailChange = this.handleDetailChange.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEventCreationForm = this.handleEventCreationForm.bind(this);
    this.processEvent = this.processEvent.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.openModal = this.openModal.bind(this);
  }

  componentDidMount() {
    this.setState({ user_id: this.props.userId }, () => {
      console.log(this.state);
    });
    // if (typeof this.props.event !== 'undefined') {
    //   this.setState({ event_form_data: this.props.event });
    // }
    // console.log(this.state.edit_mode);
  }

  // /**
  //  * whenever a change is made to the detail input, update the this.state.detail
  //  * @param {string} detail - The detail of the item ????.
  //  */
  // handleDetailChange(event) {
  //   this.setState({
  //     detail: event.target.value,
  //   });
  // }

  /**
   * Whenever a field is updated in the form, update the corresponding state variable
   * @param {SyntheticEvent} event - React SyntheticEvent
   */
  handleEventCreationForm(event) {
    this.setState((previousState) => ({
      event_form_data: {
        ...previousState.event_form_data,
        [event.target.name]: event.target.value,
      },
    }));
  }

  /**
   * whenever a change is made to the name input, update the this.state.name
   * @param {SyntheticEvent} event - React SyntheticEvent
   */
  handleNameChange(event) {
    this.setState({
      name: event.target.value,
    });
  }

  /**
   * Not currently being used
   * @param {SyntheticEvent} event - the event of the user clicking the submit button
   */
  handleSubmit(event) {
    event.preventDefault();

    const csrftoken = Cookies.get('csrftoken');

    const newItem = {
      name: this.state.name,
      detail: this.state.detail,
    };
    // console.log(newItem);
    // console.log(JSON.stringify(newItem));
    fetch('/api/items/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrftoken,
        'Content-Type': 'application/json',
        Authorization: `JWT ${localStorage.getItem('token')}`,
      },
      credentials: 'same-origin',
      body: JSON.stringify(newItem),
    }).then((res) => {
      console.log('res.json', res.json());
    }).then((data) => {
      console.log('data', data);
      // reset the state to blank values
      this.setState({
        name: '',
        detail: '',
      });
      window.location.reload();
    });
  }

  /**
   * Validate start date is in valid form and is not before today.
   * @param {string} start - Date to be validated
   */
  validateStartDate(start) {
    const startDate = moment(start, 'YYYY-MM-DD');
    const dateNow = moment();

    if (!startDate.isValid()) {
      this.setState({
        incomplete_alert: 'Start date is not in a valid format.',
      });
      return 0;
    }
    if (startDate < dateNow) {
      this.setState({
        incomplete_alert: 'Start date cannot be before today.',
      });
      return 0;
    }
    return 1;
  }

  /**
   * Validate end date is in valid format and not before start date
   * @param {string} end - Date to be validated
   */
  validateEndDate(end, start) {
    const endDate = moment(end, 'YYYY-MM-DD');
    const startDate = moment(start, 'YYYY-MM-DD');
    const dateNow = moment();

    if (!endDate.isValid()) {
      this.setState({
        incomplete_alert: 'End date is not in a valid format.',
      });
      return 0;
    }
    if (endDate < startDate) {
      this.setState({
        incomplete_alert: 'End date cannot be before start date.',
      });
      return 0;
    }
    if (endDate < dateNow) {
      this.setState({
        incomplete_alert: 'End date cannot be before today.',
      });
      return 0;
    }
    return 1;
  }

  /**
   * Close the modal
   */
  closeModal() {
    this.setState({ isOpen: false });
  }

  /**
   * Open the modal
   */
  openModal() {
    this.setState({ isOpen: true });
  }

  /**
   * Process form submission in either edit or create mode
   */
  async processEvent() {
    let flag = 0;
    const formFields = ['startDate', 'endDate', 'location', 'description', 'name'];
    formFields.forEach((field) => {
      if (!(field in this.state.event_form_data) || this.state.event_form_data[field] === '') {
        this.setState({
          incomplete_alert: `${field} is required`,
        });
        flag = 1;
      }
    });

    const start = this.state.event_form_data.startDate;
    const end = this.state.event_form_data.endDate;
    if (!this.validateStartDate(start) || !this.validateEndDate(end, start)) {
      flag = 1;
    }
    if (flag === 0) {
      const temp = this.state.event_form_data;
      temp.user_id = this.state.user_id;
      this.setState({ incomplete_alert: null });
      let endpoint;
      let verb;
      if (this.state.edit_mode) {
        endpoint = `/api/event/${this.state.event_form_data.eventId}/`;
        verb = 'PATCH';
      } else {
        endpoint = '/api/event/';
        verb = 'POST';
      }
      const so = await httpReq(endpoint, temp, verb);
      if (so.status === '1') {
        this.closeModal();
        if (this.state.edit_mode) {
          this.props.doneFunction(this.state.event_form_data);
        } else {
          this.setState({
            event_form_data: {},
          });
          this.props.doneFunction(this.state.user_id);
        }
      }
    }
  }

  render() {
    return (
      <div>
        <Button
          variant={this.state.edit_mode ? 'outline-primary' : 'primary'}
          onClick={this.openModal}
        >
          {this.state.edit_mode
            ? (
              <span>
                <i className="fa fa-edit" />
                {' '}
                Edit Event Details
              </span>
            )
            : (
              <div>
                <i className="fa fa-plus" />
                Add New Event
              </div>
            )}
        </Button>
        <i className="fa fa-edit mobile" />
        { this.state.isOpen ? (
          <Modal show={this.state.isOpen} onHide={this.closeModal}>
            <Modal.Header closeButton>
              <Modal.Title>{this.state.edit_mode ? 'Edit Event Details' : 'Create New Event'}</Modal.Title>
            </Modal.Header>
            {this.state.incomplete_alert ? <Alert variant="danger">{this.state.incomplete_alert}</Alert>
              : null}
            <Modal.Body>
              <Form>
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <Form.Control type="text" name="name" defaultValue={this.state.event_form_data ? this.state.event_form_data.name : ''} placeholder="Enter an Event Name." onChange={this.handleEventCreationForm} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} name="description" defaultValue={this.state.event_form_data ? this.state.event_form_data.description : ''} placeholder="Enter Description of event." onChange={this.handleEventCreationForm} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Location</Form.Label>
                  <Form.Control type="text" name="location" defaultValue={this.state.event_form_data ? this.state.event_form_data.location : ''} placeholder="Enter Location for event." onChange={this.handleEventCreationForm} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Start date</Form.Label>
                  <Form.Control type="date" name="startDate" defaultValue={this.state.event_form_data ? this.state.event_form_data.startDate : ''} placeholder="Enter Start date for event.(mm/dd/yyyy)" onChange={this.handleEventCreationForm} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>End date</Form.Label>
                  <Form.Control type="date" name="endDate" defaultValue={this.state.event_form_data ? this.state.event_form_data.endDate : ''} placeholder="Enter End date for event.(mm/dd/yyyy)" onChange={this.handleEventCreationForm} />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.closeModal}>
                Close
              </Button>
              <Button variant="primary" onClick={this.processEvent}>
                {this.state.event_form_data ? 'Save' : 'Create Event'}
              </Button>
            </Modal.Footer>
          </Modal>
        ) : null}
      </div>
    );
  }
}

export default EventForm;
