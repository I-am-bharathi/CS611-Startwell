import React, { useState } from 'react'
import 'antd/dist/antd.css';
import { Button, Descriptions, Divider, Select, Tag, Typography, Affix, DatePicker} from 'antd';
import { AppstoreOutlined, MailOutlined, SettingOutlined, UserOutlined, PoweroffOutlined, FrownOutlined, MehOutlined } from '@ant-design/icons';
import { Layout, Menu, Breadcrumb, Avatar, Card, Col, Row, Image, Collapse, Badge, Rate, Carousel, Form, Input, Spin} from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import moment from 'moment';
import './ChangePersonalDetails.css';
import axios from 'axios';
import logo from '../../Assets/logo_color3.jpg'
import { Link } from 'react-router-dom';
const {Option} = Select;
const { Header, Content, Footer, Sider } = Layout;
const{Title}=Typography;
const {SubMenu} = Menu;
var sub = 'Gold';
var userimg = '';
var subcolor = sub;
if(sub=='Free')
{
    subcolor='brown';
}
var userEmail = 'Charles@User.com'
var fname = 'Charles'
var lname = 'User'

var Sex = 'Male'

class Subscriptions extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
          token:"",
          email: "",
          fname: "",
          lname: "",
          DOB:"",
          Sex: "",
          Subscription: "None",
          LicenseID: "",
          userType:"",
          field:"Subscription",
          disab:"",
          pwd:"",
          subdisabled: false,
        };
    }

    componentDidMount(){
        const queryParams = new URLSearchParams(window.location.search);
        var usid = queryParams.get('token');
        var typ = queryParams.get('usertype');
        this.setState({token:usid});
        this.setState({userType:typ});
        if(typ=='C')
        {
            this.setState({field:"Subscription"})
            this.setState({disab:"Change"})
        }
        else
        {
            this.setState({field:"License ID"})
        }


        axios.get("http://206.189.195.166:3200/profiledetails", {
        headers:{
            token: usid,
        } 
        }).then(
            res =>{
              const q = res.data;
              var date = q.dob;
            //   if(date==null)
            //   {
            //     date = new Date('2020-04-13');
            //   }
              var sx = q.sex;
              if(sx==null)
              {
                sx = "Update your details!"
              }
              this.setState({email: q.email})
              this.setState({fname: q.First_Name});
              this.setState({lname: q.lastname});
              this.setState({DOB: date});
              this.setState({Sex: sx});
              this.setState({LicenseID:q.LicenseID});
              this.setState({Subscription:q.Subscription});
              this.setState({pwd:q.pass});
              
            }
        )
        if(this.state.Subscription=="" && typ=='C')
        {
            this.setState({Subscription:"None"})
        }
    }

    handleEmail = e => {
        var x = e.target.value;
        this.setState({email:x});
    }
    handleFname = e => {
        var x = e.target.value;
        this.setState({fname:x});
    }
    handleLname = e => {
        var x = e.target.value;
        this.setState({lname:x});
    }
    handleDob = (e,f) => {
        var x = f;
        this.setState({DOB:x});
    }
    handleSex = e => {
        var x = e.target.value;
        this.setState({Sex:x});
    }
    handleField = e => {
        var x = e.target.value;
        this.setState({LicenseID:x});
        this.setState({Subscription:x});
    }

    handleSubmit = (e) => {
        this.setState({subdisabled:true})
        console.log(this.state.DOB)
        axios.put("http://206.189.195.166:3200/profileupdate",{
            headers:{
                token: this.state.token,
            },
            token: this.state.token,    
            EmailID: this.state.email,
            dob: String(this.state.DOB),
            sex: this.state.Sex,
            fname: this.state.fname,
            lname: this.state.lname,
            Pass: this.state.pwd,
            LicenseID: this.state.LicenseID,
        }).then(
            res =>{
                if(this.state.userType=='C')
                {
                    window.location='/UserDashboard?token=' + String(this.state.token);
                }
                else
                {
                    window.location='/ProviderDashboard?token=' + String(this.state.token);
                }
            }
        )
    }

    render()
    {
        var redlink;
        if(this.state.userType=='C')
        {
            redlink="/UserDashboard?token=" + String(this.state.token);
        }
        else
        {
            redlink="/ProviderDashboard?token=" + String(this.state.token);
        }
        return(
            <Layout style={{width:'100%', backgroundColor:'gray'}}>
                <Row>
                    <Col span={24}>
                        <Affix offsetTop={0}>
                            <Header style={{backgroundColor:'gray', height:'100%'}}>        
                                <Menu mode='horizontal' style={{width:'100%', height:'100%', backgroundColor:'gray'}}>
                                    <img src={logo} width={180}/>
                                    <Menu.Item key='Sign Up/Log In' className='Topnav'>
                                        <a href={redlink} style={{color:'white'}}>{this.state.fname}</a>
                                    </Menu.Item>
                                    <Menu.Item key='About' className='Topnav'>
                                        <a href='/About' style={{color:'white'}}>About</a>
                                    </Menu.Item>
                                    <Menu.Item key='Home' className='Topnav'>
                                        <a href='/Homepage' style={{color:'white'}}>Home</a>
                                    </Menu.Item>
                                </Menu>
                            </Header>
                        </Affix>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Layout className='mainSection'>
                            <Row>
                                <Col span={6}></Col>
                                <Col span={12}>
                                    <br></br>
                                    <br></br>
                                    <text className='editTitle'>Edit Personal Details</text>
                                    <Divider className = 'titleDivide' />
                                    <br></br>
                                    <Card className='cardMain' hoverable>
                                        <Row>
                                            <Col span={2}></Col>
                                            <Col style={{textAlign:'left'}} span={9}>
                                                <Image width={'80%'} src={userimg} fallback="data:image/png;base64,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"/>
                                                <br></br>
                                                <br></br>
                                                
                                            </Col>
                                            <Col span={2}></Col>
                                            <Col style={{textAlign:'left'}} span={9}>
                                                <text className='headers'>First Name</text>
                                                <br></br>
                                                <Input className='vals' disabled={this.state.subdisabled} value={this.state.fname} onChange={this.handleFname} placeholder={this.state.fname}></Input>
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                <text className='headers'>Last Name</text>
                                                <br></br>
                                                <Input className='vals' disabled={this.state.subdisabled} value={this.state.lname} onChange={this.handleLname} placeholder={this.state.lname}></Input>
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                

                                            </Col>
                                            <Col span={2}></Col>
                                        </Row>
                                        <Row>
                                            <Col span={2}></Col>
                                            <Col style={{textAlign:'left'}} span={9}>
                                                <text className='headers'>Date of Birth</text>
                                                <br></br>
                                                <br></br>
                                                <DatePicker className='vals' disabled={this.state.subdisabled} format={'YYYY-MM-DD'} mode='date' onChange={this.handleDob} placeholder={moment(this.state.DOB, 'YYYY-MM-DD')} format='YYYY-MM-DD'></DatePicker>
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                <text className='headers'>{this.state.field}</text>
                                                <br></br>
                                                <br></br>
                                                <Input value={this.state.LicenseID} disabled={this.state.subdisabled} onChange={this.handleField} placeholder={this.state.LicenseID} className='vals'></Input>
                                                <Link className='changeSub' to='/Subscriptions'>{this.state.disab}</Link>
                                            </Col>
                                            <Col span={2}></Col>
                                            <Col style={{textAlign:'left'}} span={9}>
                                                <text className='headers'>Gender</text>
                                                <br></br>
                                                <Input className='vals' value={this.state.Sex} disabled={this.state.subdisabled} onChange={this.handleSex} placeholder={this.state.Sex}></Input>
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                <text className='headers'>E-Mail ID</text>
                                                <br></br>
                                                <Input className='vals' value={this.state.email} disabled={this.state.subdisabled} onChange={this.handleEmail} placeholder={this.state.email}></Input>
                                            </Col>
                                            <Col span={2}></Col>
                                        </Row>
                                        <Row>
                                            <Col span={24} style={{textAlign:'center'}}>
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                <Button className='saveChanges' onClick={this.handleSubmit}>SAVE CHANGES&nbsp;<Spin spinning = {this.state.subdisabled} /></Button>
                                                <br></br>
                                                <br></br>
                                            </Col>
                                        </Row>
                                    </Card>
                                    <br></br>
                                    <br></br>
                                </Col>
                                <Col span={6}></Col>
                            </Row>
                        </Layout>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Footer className='footer'>
                                <h1 style={{color:'white'}}>Copyright Startwell</h1>
                        </Footer>
                    </Col>
                </Row>
            </Layout>
        )
    }
}
export default Subscriptions;
