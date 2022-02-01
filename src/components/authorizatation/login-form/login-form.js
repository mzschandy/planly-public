/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Button, Card, Col, Form,
} from 'react-bootstrap';

import './login.css';

/**
 * Class representing a Login Form.
 * @extends Component
 */
class LoginForm extends Component {
  /**
   * Create a Login Form
   * @param {string} username - The username of the person logged in.
   * @param {string} password - The password of the person logged in.
   */
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  /**
   * Handle changing the username of a person
   * @param {SyntheticEvent} event The react `SyntheticEvent
   */
  handleUsernameChange(event) {
    this.setState({ username: event.target.value });
  }

  /**
   * Handle changing the password of a person
   * @param {SyntheticEvent} event The react `SyntheticEvent
   */
  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  render() {
    return (
      <Col md={4} className="login">
        <Card>
          <Card.Header className="text-center">Log in</Card.Header>
          <Card.Body>
            <Form onSubmit={(event) => this.props.handle_login(event, this.state)}>
              <Form.Group>
                <label htmlFor="username">Username</label>
                <input type="text" className="form-control" name="username" id="username" value={this.state.username} onChange={this.handleUsernameChange} />
              </Form.Group>
              <Form.Group>
                <label htmlFor="password">Password</label>
                <input type="password" className="form-control" name="password" id="password" value={this.state.password} onChange={this.handlePasswordChange} />
              </Form.Group>
              <div className="errorText">{this.props.errors}</div>
              <Button type="submit" className="btn-block btn-primary">Log in</Button>
            </Form>
          </Card.Body>
          <div className="d-flex justify-content-center auth-switch">
            <div>
              New to Plan.ly?
              <button type="button" onClick={() => this.props.display_form('signup')} className="sign-up-link btn">Sign up for an account</button>
            </div>
          </div>
        </Card>
      </Col>
    );
  }
}

export default LoginForm;

LoginForm.propTypes = {
  handle_login: PropTypes.func.isRequired,
  display_form: PropTypes.func.isRequired,
};
