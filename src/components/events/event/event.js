/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import Cookies from 'js-cookie';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
// import Card from 'react-bootstrap/Card';
// import ListGroup from 'react-bootstrap/ListGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
// import Form from 'react-bootstrap/Form';
// import TaskLists from '../taskLists/taskLists';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faMapMarked } from '@fortawesome/free-solid-svg-icons';
// import ListGroup from 'react-bootstrap/ListGroup';
// import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import TaskLists from '../taskLists/taskLists';
import Navigation from '../../layout/navigation/navigation';
import EventForm from '../eventForm/eventForm';
import Invitee from '../../invitee/invitee';
import List from '../../list/list';

import './event.css';
import SideNav from '../../layout/sideNav/sideNav';

async function postData(url = '', verb, data2 = {}) {
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
 * Class representing an Event.
 * @extends Component
 */
class Event extends Component {
  /**
   * Create a Login Form
   * @param {string} event_owner - The username of the person who created the event.
   * @param {string} description - The description of the event.
   * @param {string} name - The name of the event.
   * @param {string} location - The location of the event.
   * @param {string} startDate - The startDate of the event.
   * @param {string} endDate - The endDate of the event.
   * @param {int} eventId - The id of the event.
   * @param {List[]} lists - Array of event todo lists.
   * @param {string} username - Username of logged in person.
   * @param {int} user_id - User id of logged in person.
   * @param {boolean} logged_in - Boolean if user is logged in.
   * @param {EventForm} eventFormComponent - Event form component to edit the event.
   * @param {EventInvitee[]} invitees - Nested list of invitees from Event record
   * @param {string} inviteeList - Running list of people about to be sent an invitation.
   * @param {string} currentUserIsOwner - Boolean to indicate whether UI shows co-owner-only tools.
   */
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      event_owner: props.location.state.selectedEvent.creator.username,
      description: null,
      name: null,
      location: 'Loading Data ...',
      startDate: null,
      endDate: null,
      eventId: props.location.state.selectedEvent.creator.event_id,
      lists: null,
      username: '',
      user_id: -1,
      logged_in: !!localStorage.getItem('token'),
      eventFormComponent: null,
      invitees: [],
      inviteeList: <Spinner animation="border" variant="info" />,
      currentUserIsOwner: null,
      taskListComponent: <Spinner animation="border" variant="danger" />,
      alertText: '',
    };
    this.handleLogout = this.handleLogout.bind(this);
    this.refreshEvent = this.refreshEvent.bind(this);
    this.fillInviteeList = this.fillInviteeList.bind(this);
    this.uninvite = this.uninvite.bind(this);
    this.deleteEvent = this.deleteEvent.bind(this);
    this.refreshList = this.refreshList.bind(this);
  }

  /**
   * Populate user state variables from API fetch call.
   * Construct variable components (eventFormComponent and add invitee component)
   * @param {SyntheticEvent} event The react `SyntheticEvent
   */
  componentDidMount() {
    fetch('/core/current_user/', {
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        // if jwt signature is expired, page will redirect to login
        if (json.detail === 'Signature has expired.') {
          localStorage.removeItem('token');
          window.location.reload();
        }

        fetch(`/api/event/${this.state.eventId}/refresh/`, {
          headers: {
            Authorization: `JWT ${localStorage.getItem('token')}`,
          },
        }).then((resEvent) => resEvent.json()).then((jsonEvent) => {
          const refreshedEvent = JSON.parse(jsonEvent);
          let iAmOwner = false;
          for (let i = 0; i < refreshedEvent.participants.length; i += 1) {
            const inviteeRecord = refreshedEvent.participants[i];
            if (inviteeRecord.user_id === json.id && inviteeRecord.isOwner) {
              iAmOwner = true;
            }
          }
          console.log(refreshedEvent);
          this.setState((prevState) => ({
            description: refreshedEvent.description,
            name: refreshedEvent.name,
            location: refreshedEvent.location,
            startDate: refreshedEvent.startDate,
            endDate: refreshedEvent.endDate,
            lists: refreshedEvent.todo_lists,
            invitees: refreshedEvent.participants,
            username: json.username,
            user_id: json.id,
            eventFormComponent: <EventForm
              show={prevState.isOpen}
              userId={json.id}
              event={{
                event_owner: prevState.event_owner,
                eventId: refreshedEvent.creator.event_id,
                description: refreshedEvent.description,
                name: refreshedEvent.name,
                location: refreshedEvent.location,
                startDate: refreshedEvent.startDate,
                endDate: refreshedEvent.endDate,
              }}
              doneFunction={this.refreshEvent}
            />,
            currentUserIsOwner: iAmOwner,
          }), () => { this.fillInviteeList(); });
        });
      }).catch((error) => console.log('fetch events error', error));
  }

  /**
   * Refresh todo list and invitee components with latest information after refresh
   * @param NewProps the updated props
   */
  componentDidUpdate(NewProps) {
    if (NewProps.location.state.selectedEvent.todo_lists.length
      !== this.props.location.state.selectedEvent.todo_lists.length) {
      this.updateToDoLists(NewProps.location.state.selectedEvent.todo_lists, 'list');
    } else {
      let flag = false;
      NewProps.location.state.selectedEvent.todo_lists.forEach((list, index) => {
        if (this.props.location.state.selectedEvent.todo_lists[index].tasks.length
          !== list.tasks.length) {
          flag = true;
        }
      });
      if (flag === true) {
        this.updateToDoLists(NewProps.location.state.selectedEvent.todo_lists, 'list');
      }
    }
    if (NewProps.location.state.selectedEvent.participants.length
      !== this.props.location.state.selectedEvent.participants.length) {
      this.updateToDoLists(NewProps.location.state.selectedEvent.participants, 'invitee');
    }
  }

  /**
   * Reset auth state variables when user logs out.
   */
  handleLogout() {
    localStorage.removeItem('token');
    this.setState({ logged_in: false, username: '' });
    window.location.reload();
  }

  /**
   * Remove invitee from event and EventInvitee databases
   * @param invitee the EventInvitee record to be deleted
   */
  async uninvite(invitee) {
    const so = await postData('/api/eventinvitee/uninvite/', 'DELETE', JSON.stringify(invitee));
    if (so.status === '1') {
      this.refreshEvent();
    } else if (so.status === '-1') {
      console.log('here');
      this.setState({
        alertText: so.body,
      });
    }
  }

  /**
   * Change passed invitee from co-owner to guest and back
   * @param invitee The EventInvitee record to be toggled
   */
  async toggle(invitee) {
    const so = await postData('/api/eventinvitee/toggle/', 'post', JSON.stringify(invitee));
    if (so.status === '1') {
      this.refreshEvent();
    }
  }

  /**
   * Delete event and all associated child objects (tasks, event invitee, lists, etc.)
   */
  async deleteEvent() {
    const response = await fetch(`/api/event/${this.state.eventId}/`, {
      method: 'DELETE',
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`,
      },
    });
    console.log(response);
    if (response.status === 200) {
      console.log('redirecting');
      this.props.history.push('/dashboard');
    }
  }

  /**
   * Populate the InviteeList area of the page with the participants of the event
   */
  fillInviteeList() {
    const names = [];
    this.state.invitees.forEach((invitee) => {
      const inviteeInitial = invitee.name.charAt(0);
      console.log('invitee', invitee);
      const popover = (
        <Popover className="popover-basic">
          <Popover.Content>
            <Col>{(!invitee.isOwner && `${invitee.name}: Guest`) || (invitee.isOwner && `${invitee.name}: Co-Owner`)}</Col>
            {this.state.currentUserIsOwner ? (
              <>
                <Button onClick={() => this.uninvite(invitee)}>Uninvite</Button>
                <Button onClick={() => this.toggle(invitee)}>Toggle</Button>
              </>
            ) : null}
          </Popover.Content>
        </Popover>
      );
      /*
      const popover2 = (
        <Popover className="popover-basic">
          <Popover.Content>
            <Col>{(!invitee.isOwner && 'Guest') || (invitee.isOwner && 'Co-Owner')}</Col>
          </Popover.Content>
        </Popover>
      ); */
      if (!this.state.currentUserIsOwner || invitee.user_id === this.state.user_id) {
        names.push(
          <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
            <div className="profileWrapper">
              <div className="inviteeProfile important profile d-flex justify-content-center align-items-center">
                <div className="profile-letter">{inviteeInitial}</div>
                {invitee.isOwner ? <i className="fa fa-star" /> : null}
              </div>
              <div className="inviteeName">
                {invitee.name}
                <i className="fa fa-caret-down" />
              </div>
            </div>
          </OverlayTrigger>,
        );
      } else {
        names.push(
          <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
            <div className="profileWrapper">
              <div className="inviteeProfile important profile d-flex justify-content-center align-items-center">
                <div className="profile-letter">{inviteeInitial}</div>
                {invitee.isOwner ? <i className="fa fa-star" /> : null}
              </div>
              <div className="inviteeName">
                {invitee.name}
                <i className="fa fa-caret-down" />
              </div>
            </div>
          </OverlayTrigger>,
        );
      }
      // const inviteeInitial = invitee.name.charAt(0);
      // names.push(inviteeInitial);
    });
    const inviteeListComponent = (
      <>
        {names}
      </>
    );
    this.setState({ inviteeList: inviteeListComponent });
  }

  /**
   * Refresh invitee and lists state variables with latest information after refresh of page.
   */
  updateToDoLists(NewData, type) {
    if (type === 'list') {
      this.setState({
        lists: NewData,
      });
    } else if (type === 'invitee') {
      this.setState({
        invitees: NewData,
      });
    }
  }

  /**
   * Update the page with latest Event data after the Edit Event Form is used.
   */
  refreshEvent() {
    console.log('somssss');
    fetch(`/api/event/${this.state.eventId}/refresh/`, {
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`,
      },
    }).then((resEvent) => resEvent.json()).then((jsonEvent) => {
      const refreshedEvent = JSON.parse(jsonEvent);
      console.log(refreshedEvent);
      this.setState({
        description: refreshedEvent.description,
        name: refreshedEvent.name,
        location: refreshedEvent.location,
        startDate: refreshedEvent.startDate,
        endDate: refreshedEvent.endDate,
        invitees: refreshedEvent.participants,
        lists: refreshedEvent.todo_lists,
      }, () => { this.fillInviteeList(); });
    });
  }

  /**
   * Helper function to fetch latest todo list data from API and update the state variables with it.
   */
  refreshList() {
    console.log(this.state);
    fetch(`/api/lists/${this.state.eventId}/`, {
      headers: {
        Authorization: `JWT ${localStorage.getItem('token')}`,
      },
    }).then((resEvent) => resEvent.json()).then((jsonLists) => {
      const jsonListsParsed = [];
      jsonLists.map((eve) => (
        jsonListsParsed.push(JSON.parse(eve))
      ));
      console.log(jsonListsParsed);
      this.setState({
        lists: jsonListsParsed,
      });
    });
  }

  render() {
    let initial = '';
    const str = this.state.username;
    initial = str.charAt(0);
    // let invitee;
    if (this.state.currentUserIsOwner) {
    // invitee = <Invitee eventId={this.state.eventId} doneFunction={this.refreshEvent} />;
    }

    return (
      <div>
        <Navigation
          nav_theme="nav-app"
          logged_in={this.state.logged_in}
          handle_logout={this.handleLogout}
          profile_initial={initial}
        />
        <div className="wrapper">
          <SideNav eventPage="active" />
          <Container fluid id="page-content" className="content">
            <Row className="header">
              <Col xs={12} className="event-name">
                <div>
                  <h1>{this.state.name}</h1>
                  <div className="hosted-by">
                    <i>
                      hosted by
                      {' '}
                      {this.state.currentUserIsOwner ? 'Me!' : this.state.event_owner}
                    </i>
                  </div>
                </div>
                <div className="edit-event">
                  {this.state.currentUserIsOwner && this.state.eventFormComponent}
                  <i className="fa fa-close" onClick={this.deleteEvent} />
                </div>
              </Col>
              <Col xs={12} className="event-details">
                <div><i className="fa fa-location-arrow" /></div>
                <div className="location">
                  {this.state.location}
                  :
                </div>
                <div className="time">
                  {this.state.startDate}
                  {' '}
                  -
                  {' '}
                  {this.state.endDate}
                </div>
              </Col>
              <Col className="event-description" xs={12}>
                {this.state.description}
              </Col>
            </Row>
            <Row className="invitees">
              <Col className="inner" xs={12}>
                <h3>Who&apos;s coming?</h3>
                {this.state.currentUserIsOwner
                  ? (
                    <Invitee
                      eventId={this.state.eventId}
                      doneFunction={this.refreshEvent}
                      currentUserIsOwner={this.state.currentUserIsOwner}
                    />
                  ) : null }
              </Col>
              <Col xs={12} className="lister">
                {this.state.alertText.length > 0 ? (
                  <Col>
                    <Alert variant="danger" dismissible>
                      {this.state.alertText}
                    </Alert>
                  </Col>
                ) : null}
                {this.state.inviteeList}
              </Col>
            </Row>
            <Row className="tasks">
              <Col className="lister" xs={12}>
                {this.state.currentUserIsOwner !== null
                  ? (
                    <TaskLists
                      todo_lists={this.state.lists}
                      event_id={this.state.eventId}
                      participants={this.state.invitees}
                      onUpdateTask={this.refreshEvent}
                      onUpdateList={this.refreshList}
                      currUserIsOwner={this.state.currentUserIsOwner}
                      currUserId={this.state.user_id}
                    />
                  ) : (<Spinner animation="border" variant="secondary" />)}
                {this.state.currentUserIsOwner !== null
                  ? (
                    <List
                      eventId={this.state.eventId}
                      userId={this.state.user_id}
                      doneFunction={this.refreshList}
                      isOwner={this.state.currentUserIsOwner}
                    />
                  ) : null}
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}

export default Event;
