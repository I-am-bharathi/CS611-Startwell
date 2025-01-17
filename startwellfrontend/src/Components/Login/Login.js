import React, { Component } from 'react';
import './Login.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Select, Layout, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Header from '../Header/Header';

const { Option } = Select;
const { Content, Footer } = Layout;

class Login extends Component {
  constructor(props) {
    super(props);
    this.userdata = {};
    this.state = {
      email: '',
      password: '',
      hasError: '',
      loggedIn: false,
      emailError: '',
      hasError: '',
      passwordError: '',
      LoginError: '',
      wrongCredentials: false
    };

    this.handleChangeEmail = this.handleChangeEmail.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleSuccessfulAuth = this.handleSuccessfulAuth.bind(this);
  }
  handleChangeEmail(event) {
    this.setState({ email: event.target.value });
  }
  handleChangePassword(event) {
    this.setState({ password: event.target.value });
  }
  handleLogin() {
    this.setState({ loggedIn: true });
  }
  handleWrongCredentials() {
    this.setState({ email: '', password: '', wrongCredentials: false });
    this.setState({ wrongCredentials: true });
  }
  handleSuccessfulAuth(data) {
    //this.props.handleLogin(data);
    console.log("data in auth", data)
    console.log("checking for usertype", data.UserType)
    if (data.UserType === "Customer") {
      window.location = `/UserDashboard?token=${data.token}`
    }
    if (data.UserType === "Admin") {
      window.location = `/Admin?token=${data.token}`
    }
    if (data.UserType === "Provider") {
      window.location = `/ProviderDashboard?token=${data.token}`
    }


  }
  validate() {
    let emailError = '';
    let passwordError = '';
    let isValid = true;

    if (!this.state.email) {
      isValid = false;
      emailError = 'Please enter your email Address.';
    }
    if (typeof this.state.email !== 'undefined') {
      var pattern = new RegExp(
        /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
      );

      if (!pattern.test(this.state.email)) {
        isValid = false;
        emailError = 'Please enter valid email address.';
      }
    }

    if (this.state.password.length < 7) {
      console.log('in password');
      isValid = false;
      passwordError = 'Password length should be greater than 7.';
    }
    if (!isValid || emailError) {
      this.setState({ passwordError });
      this.setState({ emailError });
      return false;
    }
    if (!isValid) {
      this.setState({ passwordError });
      return false;
    }

    return true;
  }

  handleSubmit(event) {
    event.preventDefault();
    this.state.passwordError = '';
    this.state.emailError = '';
    const { email, password } = this.state;
    const isValid = this.validate();
    if (isValid) {
      axios
        .post('http://206.189.195.166:3200/user/login', {
          user: {
            email: email,
            password: password
          }
        })
        .then(response => {
          if (response.data.code === 200) {
            console.log(JSON.stringify(response.data));
            localStorage.setItem('user', JSON.stringify(response.data));

            console.log('Login succesful', response);
            console.log(this.userdata);
            this.handleSuccessfulAuth(response.data);
            this.handleLogin();
            this.render();
          } else if (response.data.code === 204) {
            let LoginError = 'Email or password is incorrect';
            this.setState({ LoginError });
            console.log('Email and password does not match', response);
          } else if (response.data.code === 210) {
            let LoginError = 'Email does not exist please register';
            this.setState({ LoginError });
            console.log('Email does not exist', response);
          }
        })
        .catch(error => {
          console.log('error occured', error);
        });
    }
  }

  render() {
    return (
      <div>
        <div id='header'>
          <Header />
        </div>
        <div>
          <Layout className='content' style={{ backgroundColor: 'transparent' }}>

            <div className='banner' style={{ marginTop: '15%' }} >

              <Row>
                <Col span={12}>
                  <br></br>
                  <h1 className='BigMessage'>Welcome to Startwell </h1>
                  <h2 className='BigMessage'>Get our Best Advices </h2>
                </Col>
              </Row>

            </div>
            <Form
              name='normal_login'
              className='login-form'
              initialValues={{
                remember: true
              }}
              onSubmit={this.handleSubmit}
            >
              <h1 style={{ marginTop: '100px', fontFamily: 'Cooper Black', fontSize: '200%' }} > LOGIN </h1>
              <Form.Item
                label='Email-ID'
                name='Email-ID'
                rules={[{ required: true, message: 'Please input your Email-ID!' }]}
              >
                <Input
                  prefix={<UserOutlined className='site-form-item-icon' />}
                  placeholder='Email-ID'
                  value={this.state.email}
                  onChange={this.handleChangeEmail}
                />
              </Form.Item>
              <div style={{ fontSize: 12, color: 'red' }}>{this.state.emailError}</div>
              <Form.Item
                label='Password'
                name='password'
                rules={[{ required: true, message: 'Please input your Password!' }]}
              >
                <Input
                  prefix={<LockOutlined className='site-form-item-icon' />}
                  type='password'
                  placeholder='Password'
                  value={this.state.password}
                  onChange={this.handleChangePassword}
                />
              </Form.Item>{' '}
              <div style={{ fontSize: 12, color: 'red' }}>{this.state.passwordError}</div>
              <div style={{ fontSize: 12, color: 'red' }}>{this.state.LoginError}</div>
              <Form.Item>
                <Form.Item name='remember' valuePropName='checked' noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <a className='login-form-forgot'>
                  {' '}
                  <Link to='./ForgotPassword'>Forgot password</Link>
                </a>
              </Form.Item>
              <Form.Item>
                <div>
                  <Button type='primary' htmlType='submit' className='ant-btn-primary2' onClick={this.handleSubmit}>
                    Log in
              </Button>
                </div>
                <Link to='./SignUp'>register now!</Link>
              </Form.Item>
            </Form>
          </Layout>
        </div>
      </div>
    );
  }
}

export default Login;