/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
import Cookies from 'js-cookie';
import {
  Form, Button, Alert,
} from 'react-bootstrap';

/**
 * Form to allow user to add a new taskList
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

class List extends Component {
  /**
   * Create a List
   * @param {string} name - The name of the list to be added
   * @param {boolean} isOpen - Boolean if the modal is currently open
   * @param {string} incomplete_alert - String description of any missing required fields, etc.
   * @param {string} event_id - Event ID for the task list to be tied to in the back-end
   * @param {string} user_id - User ID of currently logged in user (for tracking)
   */
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      incomplete_alert: null,
      eventId: props.eventId,
      userId: props.userId,
      isOwner: props.isOwner,
    };
    this.handleInput = this.handleInput.bind(this);
    this.handleSave = this.handleSave.bind(this);
    // this.handleRemove = this.handleRemove.bind(this);
  }

  /*
   * Fetch JWT when component mounts
  */
  componentDidMount() {
    fetch('/core/current_user/', {
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        this.setState({
          userId: json.id,
        });
      });
  }

  /*
   * Update state when the field is updated
  */
  handleInput(event) {
    this.setState(({
      [event.target.name]: event.target.value,
    }));
  }

  /*
   * Process the saving of the form and create the new task list
  */
  async handleSave() {
    console.log('Clicked the save button');
    const objec = {
      name: this.state.name,
      description: this.state.description,
      event_id: this.state.eventId,
      user_id: this.state.userId,
    };
    console.log(objec);
    const so = await postData('/api/lists/', objec);
    if (so.status === '1') {
      console.log('here');
      this.props.doneFunction();
      this.setState({
        name: '',
        description: '',
      }, () => { this.toggleCreateList(); });
    }
  }

  /**
   * Show or hide the form based on user's preference
   */
  toggleCreateList = () => {
    document.getElementById('newListHeader').classList.toggle('hideAdd');
    document.getElementById('newListForm').classList.toggle('showForm');
  };

  render() {
    return (
      <div>
        <div className="newTaskList">
          {this.props.isOwner
            ? (
              <div onClick={this.toggleCreateList} id="newListHeader" className="newListHeader">
                <i className="fa fa-plus" />
                New Task List
              </div>
            )
            : console.log(this.state.isOwner)}
          <div id="newListForm" className="newListForm">
            {this.state.incomplete_alert ? <Alert variant="danger">{this.state.incomplete_alert}</Alert> : null}
            <Form>
              <input name="name" className="form-control" type="text" placeholder="e.g. Food" value={this.state.name} onChange={this.handleInput} />
              <input name="description" className="form-control" type="text" placeholder="e.g. eg organize food" value={this.state.description} onChange={this.handleInput} />
              <div className="buttons">
                <Button onClick={this.handleSave}>Create List</Button>
                <Button onClick={this.toggleCreateList} className="cancel">Cancel</Button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

export default List;
