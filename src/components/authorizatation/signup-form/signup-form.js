import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Col, Card, Form, Button,
} from 'react-bootstrap';

import './signup.css';

/**
 * Class representing a SignUp Form.
 * @extends Component
 */
class SignupForm extends Component {
  /**
   * Create a Signup Form
   * @param {string} username - The username of the person creating an account.
   * @param {string} password - The password of the person creating an account.
   * @param {string} email - The email of the person creating an account.
   * @param {string} first_name - The first_name of the person creating an account.
   * @param {string} last_name - The last_name of the person creating an account.
   */
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: '',
      email: '',
      first_name: '',
      last_name: '',
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { name } = event.target;
    const { value } = event.target;

    this.setState((state) => {
      const newState = { ...state };

      newState[name] = value;

      return newState;
    });
  }

  render() {
    return (
      <Col md={6}>
        <Card>
          <Card.Header className="text-center">Sign up</Card.Header>
          <Card.Body>
            <Form onSubmit={(event) => this.props.handle_signup(event, this.state)}>
              <Form.Row>
                <Col className="form-group">
                  <input type="text" className="form-control" name="first_name" value={this.state.first_name} onChange={this.handleChange} placeholder="Enter your first name" />
                </Col>
                <Col className="form-group">
                  <input type="text" className="form-control" name="last_name" value={this.state.last_name} onChange={this.handleChange} placeholder="Enter your last name" />
                </Col>
              </Form.Row>
              <Form.Group>
                <input type="email" className="form-control" name="email" value={this.state.email} onChange={this.handleChange} placeholder="Enter your email" />
              </Form.Group>
              <Form.Group>
                <input type="text" className="form-control" name="username" value={this.state.username} onChange={this.handleChange} placeholder="Ener a username" />
              </Form.Group>
              <Form.Group>
                <input type="password" className="form-control" name="password" value={this.state.password} onChange={this.handleChange} placeholder="Enter a password" />
              </Form.Group>
              <Button type="submit" className="btn-block btn-primary">Sign up</Button>
            </Form>
          </Card.Body>
          <div className="d-flex justify-content-center auth-switch">
            <div>
              Have an account?
              <button type="button" onClick={() => this.props.display_form('login')} className="login-link btn">Log in</button>
            </div>
          </div>
        </Card>

        {/*
        <h1>Signup Component</h1>
        <form onSubmit={(event) => this.props.handle_signup(event, this.state)}>
          <input type="text" name="username" value={this.state.username}
          onChange={this.handleChange} placeholder="Ener a username" />
          <input type="password" name="password" value={this.state.password}
          onChange={this.handleChange} placeholder="Enter a password" />
          <input type="text" name="first_name" value={this.state.first_name}
           onChange={this.handleChange} placeholder="Enter your first name" />
          <input type="text" name="last_name" value={this.state.last_name}
          onChange={this.handleChange} placeholder="Enter your last name" />
          <input type="email" name="email" value={this.state.email}
          onChange={this.handleChange} placeholder="Enter your email" />
          <input type="submit" />
        </form> */}

      </Col>
    );
  }
}

export default SignupForm;

SignupForm.propTypes = {
  handle_signup: PropTypes.func.isRequired,
};
