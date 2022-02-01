/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
// import Nav from 'react-bootstrap/Nav';
// import Tab from 'react-bootstrap/Tab';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
// import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
// import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
// import Popover from 'react-bootstrap/Popover';
// import { InputGroup, FormControl } from 'react-bootstrap';
import Cookies from 'js-cookie';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTimes, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import '../events.css';

// async function postData(url = '', data2 = {}) {
//   // Default options are marked with *
//   const csrftoken = Cookies.get('csrftoken');
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

/**
 * Class representing the TaskLists area at bottom of the event page
 * @extends Component
 */
class TaskLists extends Component {
  /**
   * Create TaskLists component
   * @param {List[]} todo_lists - Array of List objects representing overall task lists
   * @param {EventInvitee[]} participants - Array of EventInvitee objects for the event
   * @param {string} task_name - State variable for name of task about to be created by user.
   * @param {string} chosen_participant - ID of user about to be assigned the new task.
   * @param {int} list_index - Index of list about to be added.
   * @param {boolean} currUserIsOwner - Boolean indicating whether current user is an owner
   */
  constructor(props) {
    super(props);
    this.state = {
      todo_lists: this.props.todo_lists,
      participants: this.props.participants,
      task_name: '',
      chosen_participant: '0',
      list_index: 0,
      currUserIsOwner: props.currUserIsOwner,
      currUserId: props.currUserId,
    };
    this.AddTask = this.AddTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.deleteList = this.deleteList.bind(this);
    this.handleListChange = this.handleListChange.bind(this);
    this.handleOptionChange2 = this.handleOptionChange2.bind(this);
    this.markItemComplete = this.markItemComplete.bind(this);
    this.closeCreateTask = this.closeCreateTask.bind(this);
  }

  componentDidMount() {
    // Define anything that needs to start here.
    console.log(this.state);
  }

  /**
   * Update todo lists after page refresh to make sure we have the latest information
   */
  componentDidUpdate(prevProps) {
    if (prevProps.todo_lists.length !== this.props.todo_lists.length) {
      console.log('hererererereererqqqq');
      this.updateToDoLists(this.props.todo_lists, 'list');
    } else {
      let flag = false;
      this.props.todo_lists.forEach((list, index) => {
        if (prevProps.todo_lists[index].tasks.length !== list.tasks.length) {
          flag = true;
        }
      });
      if (flag === true) {
        this.updateToDoLists(this.props.todo_lists, 'list');
      }
    }
    if (prevProps.participants.length !== this.props.participants.length) {
      this.updateToDoLists(this.props.participants, 'invitee');
    }
    if (prevProps.currUserIsOwner !== this.props.currUserIsOwner) {
      this.updateCurrUserRole(this.props.currUserIsOwner);
    }
  }

  /**
   * Update the list_index when a new list is selected by the user.
   */
  handleListChange(key) {
    this.setState({
      list_index: Number(key),
    });
  }

  /**
   * Process when the user selects a new participant from the dropdown to assign a task
   */
  handleOptionChange = (event) => {
    this.setState({ chosen_participant: event.target.value });
  }

  /**
   * Handle owner change of a todo list
   */
  async handleOptionChange2(listIndex, taskIndex, event = null) {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    if (event !== null) {
      const selectedTask = this.state.todo_lists[listIndex].tasks[taskIndex];
      const newAssigned = this.state.participants.filter((x) => x.name === event.target.value);
      const response = await httpReq(`/api/tasks/${selectedTask._id}/changeOwner/`, newAssigned, 'POST');
      const updatedLists = JSON.parse(response);
      updatedLists.map((list) => {
        list.tasks.map((ele) => {
          const participant = this.state.participants
            .filter((invitee) => invitee.user_id === ele.invitee_assigned.user_id);
          ele.invitee_assigned.name = participant.name;
          return ele;
        });
        return list;
      });
      this.setState({ todo_lists: updatedLists }, () => { console.log(this.state.todo_lists); });
    }
  }

  /**
   * Update state variable to hold task name when it is updated by user.
   */
  handleNameChange = (event) => this.setState({ task_name: event.target.value });

  /**
   * Toggle form and reset state
   */
  closeCreateTask = () => {
    document.getElementById(this.state.addTaskId).classList.remove('hideAdd');
    document.getElementById(this.state.addTaskFormId).classList.remove('showForm');
    this.setState({
      addTaskId: '',
      addTaskFormId: '',
    });
  };

  /**
   * Make a fetch call to back-end to delete a task
   */
  async deleteTask(listIndex, taskIndex) {
    // console.log(e);
    const selectedTask = this.state.todo_lists[listIndex].tasks[taskIndex];
    const response = await fetch(`/api/tasks/${selectedTask._id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`,
      },
    });
    if (response.status === 200) {
      const removeTask = (list) => {
        const updatedList = list.map((ele, index) => {
          if (index !== listIndex) {
            return ele;
          }
          const filteredList = ele.tasks.filter((task, index2) => index2 !== taskIndex);
          return {
            ...ele,
            tasks: filteredList,
          };
        });
        return updatedList;
      };
      this.setState((prevState) => ({
        todo_lists: removeTask(prevState.todo_lists),
      }));
      this.props.onUpdateTask();
    }
  }

  /**
   * Make a fetch call to back-end to delete an entire list
   */
  async deleteList(listIndex) {
    const selectedList = this.state.todo_lists[listIndex];
    const response = await fetch(`/api/lists/${selectedList._id}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`,
      },
    });
    if (response.status === 200) {
      this.setState((prevState) => ({
        todo_lists: prevState.todo_lists.filter((list, i) => i !== listIndex),
      }));
    }
  }

  /**
   * Make a fetch call to back-end to add a task on a task list
   */
  async AddTask() {
    /* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
    const taskName = this.state.task_name;
    const inviteeAssigned = this.state.participants[this.state.chosen_participant];
    const ListId = this.state.todo_lists[this.state.list_index]._id;
    const so = await httpReq('/api/tasks/', {
      invitee_assigned: inviteeAssigned,
      name: taskName,
      completed: false,
      list_id: ListId,
      priority: 1,
    }, 'POST');
    if (so.status === '1') {
      so.task = JSON.parse(so.task);
      console.log('here', this.state.list_index, so.task, this.state.todo_lists);
      this.setState((prevState) => ({
        todo_lists: prevState.todo_lists.map((list, i) => {
          if (i === prevState.list_index) {
            return {
              ...list,
              tasks: list.tasks.concat(so.task),
            };
          }
          return list;
        }),
        task_name: '',
        chosen_participant: 0,
      }), () => { this.closeCreateTask(); });
    }
  }

  /**
   * Make a fetch call to back-end to mark a task as complete
   */
  async markItemComplete(taskId, taskIndex, listIndex) {
    const endpoint = `/api/tasks/${taskId}/complete/`;
    const verb = 'PATCH';
    const so = await httpReq(endpoint, '', verb);
    console.log(JSON.parse(so.task), taskId, this.state);
    if (so.status === '1') {
      console.log(taskIndex);
      this.setState((prevState) => ({
        todo_lists: prevState.todo_lists.map((list, li) => (
          li === listIndex ? JSON.parse(so.task) : list
        )),
      }), () => { console.log(this.state.todo_lists); });
    }
  }

  /**
   * Update either the participants drop-down or the to-do list array
   */
  updateToDoLists(NewData, type) {
    if (type === 'list') {
      this.setState({
        todo_lists: NewData,
      }, () => { console.log(this.state.todo_lists); });
    } else if (type === 'invitee') {
      this.setState({
        participants: NewData,
      });
    }
  }

  /**
   * Update state variable to mark if current user is an owner
   */
  updateCurrUserRole(data) {
    this.setState({
      currUserIsOwner: data,
    });
  }

  /**
   * Populate list of tasks for inclusion in the render() output.
   */
  renderTasks() {
    const openCreateTask = (e) => {
      // console.log(e.currentTarget.id);
      const header = e.currentTarget.id;
      this.setState({
        addTaskId: header,
        addTaskFormId: `${header}Form`,
      });
      // console.log(this.s)
      window.setTimeout(() => {
        const element = document.getElementById(this.state.addTaskId);
        const el = element.closest('div .taskList');
        console.log(element);
        console.log(el.getAttribute('eventKey'));
        this.setState({
          // eslint-disable-next-line react/no-unused-state
          list_index: Number(el.getAttribute('eventKey')),
        });
        document.getElementById(this.state.addTaskId).classList.add('hideAdd');
        document.getElementById(this.state.addTaskFormId).classList.add('showForm');
      }, 1000);
    };
    console.log(this.state.todo_lists);
    return (
      this.state.todo_lists.map(function (ele, index) {
        let taskListGroup = null;
        if (ele.tasks.length > 0) {
          taskListGroup = ele.tasks.map((task, taskIndex) => {
            const assignedTo = this.state.participants.filter(
              (participant) => participant.user_id === task.invitee_assigned.user_id,
            );
            let taskCompleteCheckbox = null;
            if (task.invitee_assigned.user_id === this.state.currUserId
              || this.state.currUserIsOwner) {
              if (task.completed) {
                taskCompleteCheckbox = <input type="checkbox" checked onClick={() => { this.markItemComplete(task._id, taskIndex, index); }} />;
              } else {
                taskCompleteCheckbox = <input type="checkbox" onClick={() => { this.markItemComplete(task._id, taskIndex, index); }} />;
              }
            } else {
              taskCompleteCheckbox = <input type="checkbox" disabled />;
            }
            return (
              <Card body className={this.state.currUserIsOwner ? 'todo owner' : 'todo'}>
                <div className="todo-body">
                  <div className="">
                    {taskCompleteCheckbox}
                    <div className="name">{task.name}</div>
                  </div>
                  { this.state.currUserIsOwner ? (
                    <i className="fa fa-close delete" onClick={() => { this.deleteTask(index, taskIndex); }} />
                  ) : null}
                </div>
                <div className="assigned">
                  <div className="label">Assigned to:</div>
                  {this.state.currUserIsOwner ? (
                    <Form.Control as="select" value={assignedTo[0].name} onChange={(event) => { this.handleOptionChange2(index, taskIndex, event); }}>
                      {this.state.participants.map(
                        (invitee) => (<option value={invitee.name}>{invitee.name}</option>),
                      )}
                    </Form.Control>
                  ) : (
                    <p className="small">
                      {assignedTo[0].name}
                    </p>
                  )}
                </div>
              </Card>
            );
          });
        } else taskListGroup = <h6>No Tasks to show in this list.</h6>;

        const tasksTemp = (
          <div className="taskList" eventKey={index}>
            <div className="list-head">
              <div>{ele.name}</div>
              {this.state.currUserIsOwner ? (
                <i className="fa fa-close" onClick={() => { this.deleteList(index); }} />
              ) : null}
            </div>
            <div className="mt-1">
              <small className="text-muted">
                {ele.description}
              </small>
            </div>
            { taskListGroup }
            <div className="new-task">
              <div onClick={openCreateTask} id={`newTaskHeader${index}`} className="newTaskHeader">
                <i className="fa fa-plus" />
                New Task
              </div>
              <div id={`newTaskHeader${index}Form`} className="newTaskForm">
                <Form>
                  <input className="form-control" type="text" placeholder="e.g. get pastries" value={this.state.task_name} onChange={this.handleNameChange} />
                  <Form.Control as="select" defaultValue="0" value={this.state.chosen_participant} onChange={this.handleOptionChange}>
                    {this.state.participants.map(
                      (invitee, index2) => (<option value={index2}>{invitee.name}</option>),
                    )}
                  </Form.Control>
                  <div className="buttons">
                    <Button onClick={this.AddTask}>Create Task</Button>
                    <Button onClick={this.closeCreateTask} className="cancel">Cancel</Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        );
        return tasksTemp;
      }, this)
    );
  }

  render() {
    // let NewTaskForm = null;
    let renderLists = null;
    if (this.state.todo_lists.length > 0) {
      renderLists = this.renderTasks();
    }

    return (
      <>
        {renderLists}
      </>
    );
  }
}

export default TaskLists;
