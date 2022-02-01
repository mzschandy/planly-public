import React, { Component } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
// import Navigation from '../layout/navigation/navigation';
import LoginForm from './login-form/login-form';
import SignupForm from './signup-form/signup-form';

import './auth.css';

export default class Auth extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayed_form: '',
      logged_in: !!localStorage.getItem('token'),
      username: '',
      errors: '',
    };

    this.handleSignup = this.handleSignup.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.displayForm = this.displayForm.bind(this);
  }

  // When the component loads, get the jwt in local storage if a user is logged in
  componentDidMount() {
    if (this.state.logged_in) {
      fetch('/core/current_user/', {
        headers: {
          Authorization: `JWT ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.detail === 'Signature has expired.') {
            console.log('!jwt expired!');
            // window.location.href('/login');
          }
          this.setState({ username: json.username });
        }).catch((error) => console.log('token expired? unauthorized access', error));
    }
  }

  handleSignup(event, data) {
    event.preventDefault();

    console.log(data);

    // send the user data from the signup form to our API
    fetch('/core/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        localStorage.setItem('token', json.token);
        this.setState({
          displayed_form: '',
          logged_in: true,
          username: json.username,
        });
      });
  }

  /* When the user logs out, logged_in to false,
  delete jwt in local storage, and set state.username to empty */
  handleLogout() {
    localStorage.removeItem('token');
    this.setState({ logged_in: false, username: '' });
  }

  /* Send a request to our API to get a jwt from django
    return the jwt and save it in local storage
  */
  handleLogin(event, data) {
    event.preventDefault();

    fetch('/token-auth/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => {
        localStorage.setItem('token', json.token);
        this.setState({
          displayed_form: '',
          logged_in: true,
          username: json.user.username,
          errors: '',
        });

        console.log(this.state.username);
        window.location.href = '/dashboard';
      }).catch(() => {
        this.setState({
          errors: 'Incorrect username/password. Please try again',
        });
      });
  }

  displayForm(form) {
    this.setState({
      displayed_form: form,
    });
  }

  render() {
    let form;

    switch (this.state.displayed_form) {
      case 'login':
        form = (
          <LoginForm
            display_form={this.displayForm}
            handle_login={this.handleLogin}
            errors={this.state.errors}
          />
        );
        break;
      case 'signup':
        form = <SignupForm display_form={this.displayForm} handle_signup={this.handleSignup} />;
        break;
      default:
        form = (
          <LoginForm
            display_form={this.displayForm}
            handle_login={this.handleLogin}
            errors={this.state.errors}
          />
        );
    }
    return (
      <div id="authorization">
        {/*
          <Navigation
          logged_in={this.state.logged_in}
          display_form={this.displayForm}
          handle_logout={this.handleLogout}
        />
        */}

        <Container>
          <Row>
            <Col className="text-center">
              <h1>Welcome to Plan.ly</h1>
            </Col>
          </Row>
          <Row className="justify-content-center">
            {form}
          </Row>
        </Container>
        {/*
          <h3>
          {this.state.logged_in
            ? `Hello, ${this.state.username}`
            : 'Please Log In'}
        </h3>
        */}
      </div>
    );
  }
}
