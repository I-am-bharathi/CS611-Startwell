import React, { useState } from 'react'
import 'antd/dist/antd.css';
import { Button, Descriptions, Divider, Tag, Typography, Affix, Select} from 'antd';
import { UserOutlined, LogoutOutlined, PlusSquareOutlined, MonitorOutlined} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Breadcrumb, Avatar, Card, Col, Row, Image, Collapse, Badge, Rate} from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import './CrossReference.css';
import logo from '../../Assets/SmartLogo.png'
import axios from 'axios';
import { Redirect } from "react-router-dom";
import profimg from '../../Assets/prof.png'
import { Link } from 'react-router-dom';
const { Header, Content, Footer, Sider } = Layout;
const{Title}=Typography;
const {SubMenu} = Menu;
const { Panel } = Collapse;
const { Option } = Select;

class CrossReference extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            usid: 0,
            thid: 0,
            usq: 0,
            thq: 0,
            userSurveyList: [],
            userIdList: [],
            userQuestions: [{
                QText:"",
                options: {
                    optionId: 1,
                    OptionText: "",
                }
            }],
            userQID: 0,
            therapistQID: 0,
            therapistQuestions: [{
                QText:"",
                options: {
                    optionId: 1,
                    OptionText: "",
                }
            }],
            therapistSurveyList: [],
            therapistIdList: [],
            unoq: 0,
            tnoq: 0,
            success: "",
            disabControl: true,
            userOID: 0,
            therapistOID: 0,
            userOText: "",
            therapistOText: "",
        };
    }


    componentDidMount()
    {
        var usid = "123";
        axios.get("http://206.189.195.166:3200/displayUserSurvey", {
        headers:{
            token: usid,
        } 
        }).then(
            res =>{
                var tit = [];
                var desc = [];
                var sid = [];
                const q = res.data;
                var i;
                for(i=0;i<q.length;i++)
                {
                    sid.push(q[i].SurveyID)
                    tit.push(q[i].SurveyTitle);
                }
                this.setState({userSurveyList:tit});
                this.setState({userIdList:sid});
            }
        )

        axios.get("http://206.189.195.166:3200/displayTherapistSurvey", {
        headers:{
            token: usid,
        } 
        }).then(
            res =>{
                var tit = [];
                var desc = [];
                var sid = [];
                const q = res.data;
                var i;
                for(i=0;i<q.length;i++)
                {
                    sid.push(q[i].SurveyID)
                    tit.push(q[i].SurveyTitle);
                }
                this.setState({therapistSurveyList:tit});
                this.setState({therapistIdList:sid});
            }
        )
    }

    UserSurveyDisplay() {
        var i;
        var s = [];
        for(i=0;i<this.state.userSurveyList.length;i++)
        {
            s.push(
                <Menu.Item className='SurveyLists' key={i}>
                    {this.state.userSurveyList[i]}
                </Menu.Item>
            )
            s.push(
                <Menu.Divider></Menu.Divider>
            )
        }
        return s;
    }

    TherapistSurveyDisplay() {
        var i;
        var s = [];
        for(i=0;i<this.state.therapistSurveyList.length;i++)
        {
            s.push(
                <Menu.Item className='SurveyLists' key={i}>
                    {this.state.therapistSurveyList[i]}
                </Menu.Item>
            )
            s.push(
                <Menu.Divider></Menu.Divider>
            )
        }
        return s;
    }

    userClick = (e) => {
        var x = parseInt(e.key);
        this.setState({usid:x});
    }

    therapistClick = (e) => {
        var x = parseInt(e.key);
        this.setState({thid:x});
    }

    selected = (e) => {
        axios.get("http://206.189.195.166:3200/surveyQandOpt", {
        params:{
            surveyId: String(this.state.userIdList[this.state.usid]),
        } 
        }).then(
        res =>{
            const q = res.data;
            this.setState({userQuestions: q});
            this.setState({unoq:q.length});
        }
        )
        this.setState({usfinid:this.state.userIdList[this.state.usid]})


        axios.get("http://206.189.195.166:3200/surveyQandOpt", {
        params:{
            surveyId: String(this.state.therapistIdList[this.state.thid]),
        } 
        }).then(
        res =>{
            const q = res.data;
            this.setState({therapistQuestions: q});
            this.setState({tnoq:res.data.length});
        }
        )
        this.setState({thfinid:this.state.therapistIdList[this.state.thid]})
        this.setState({disabControl:false})

    }

    UserGen()
    {
        var q = this.state.unoq;
        var s = [];
        var i = 0;
        for(i=0;i<q;i++)
        {
            s.push(
                <Option value = {String(i+1)}>
                    <p>Question {i+1}</p>
                </Option>
            )
        }
        return s;
    }

    TherapistGen()
    {
        var q = this.state.tnoq;
        var s = [];
        var i = 0;
        for(i=0;i<q;i++)
        {
            s.push(
                <Option value = {String(i+1)}>
                    <p>Question {i+1}</p>
                </Option>
            )
        }
        return s;
    }

    userSelection = (e) => {
        this.setState({success:""})
        this.setState({userQID:e-1})
    }

    therapistSelection = (e) => {
        this.setState({success:""})
        this.setState({therapistQID:e-1})
    }

    userOptGen(){
        var x = this.state.userQuestions[this.state.userQID].options;
        var i;
        var s = []; 
        for(i=0;i<x.length;i++)
        {
            s.push(
                <Option value={i+1} className='Options'>
                    {x[i].OptionText}
                </Option>
            )
        }
        return s;
    }

    therapistOptGen(){
        var x = this.state.therapistQuestions[this.state.therapistQID].options;
        var i;
        var s = []; 
        for(i=0;i<x.length;i++)
        {
            s.push(
                <Option value={i+1} className='Options'>
                    {x[i].OptionText}
                </Option>
            )
        }
        return s;
    }

    submitLink = (e) => {
        console.log("------------------------------------")
        console.log(this.state.userIdList[this.state.usid])
        console.log(this.state.userSurveyList[this.state.usid])
        console.log(this.state.userQID+1)
        console.log(this.state.userQuestions[this.state.userQID].QText)
        console.log(this.state.userOID)
        console.log(this.state.userOText)

        console.log("------------------------------------")
        console.log(this.state.therapistIdList[this.state.thid])
        console.log(this.state.therapistSurveyList[this.state.thid])
        console.log(this.state.therapistQID+1)
        console.log(this.state.therapistQuestions[this.state.therapistQID].QText)
        console.log(this.state.therapistOID)
        console.log(this.state.therapistOText)

        axios.post("http://206.189.195.166:3200/addCrossReference", {
            SurveyID_Customer: this.state.userIdList[this.state.usid],
            SurveyTitle_Customer: this.state.userSurveyList[this.state.usid],
            QuesID_Customer: this.state.userQID+1,
            QText_Customer:this.state.userQuestions[this.state.userQID].QText,
            OptID_Customer: this.state.userOID,
            OptText_Customer: this.state.userOText,

            SurveyID_Provider: this.state.therapistIdList[this.state.thid],
            SurveyTitle_Provider: this.state.therapistSurveyList[this.state.thid],
            QuesID_Provider: this.state.therapistQID+1,
            QText_Provider: this.state.therapistQuestions[this.state.therapistQID].QText,
            OptID_Provider: this.state.therapistOID,
            OptText_Provider: this.state.therapistOText,
        }).then(
            res => {
                this.setState({success:"Questions linked Successfully!"})
            }
        );
        
    }

    userOptSel = (e) => {
        var x = this.state.userQuestions[this.state.userQID].options;
        
        this.setState({userOID:e})
        this.setState({userOText:x[e-1].OptionText})
    }

    therapistOptSel = (e) => {
        var x = this.state.therapistQuestions[this.state.therapistQID].options;
        
        this.setState({therapistOID:e})
        this.setState({therapistOText:x[e-1].OptionText})
    }

    render()
    {
        
        return(
            <Layout>
                <Row>
                    <Col span = {3}></Col>
                    <Col span = {8}>
                        <br></br>
                        <br></br>
                        <h1>User Survey List</h1>
                        <Menu onClick={this.userClick}>
                            {this.UserSurveyDisplay()}
                        </Menu>
                    </Col>
                    <Col span = {2}>
                        <Divider style={{backgroundColor:'black', height:'100%'}} type='vertical'></Divider>
                    </Col>
                    <Col span = {8}>
                        <br></br>
                        <br></br>
                        <h1>Therapist Survey List</h1>
                        <Menu onClick={this.therapistClick}>
                            {this.TherapistSurveyDisplay()}
                        </Menu>
                    </Col>
                    <Col span = {3}></Col>
                </Row>
                
                <Row>
                    <Col span={3}></Col>
                    <Col span={8}>
                        <br></br>
                        <h3>Current Selection:</h3>
                        <h2>{this.state.userSurveyList[this.state.usid]}</h2>
                    </Col>
                    <Col span={2}>
                        <Divider style={{backgroundColor:'black', height:'100%'}} type='vertical'></Divider>
                    </Col>
                    <Col span={8}>
                        <br></br>
                        <h3>Current Selection:</h3>
                        <h2>{this.state.therapistSurveyList[this.state.thid]}</h2>
                    </Col>
                    <Col span={3}></Col>
                </Row>
                
                <Row>
                    <Col span={3}></Col>
                    <Col span={18}>
                        <br></br>
                        <br></br>
                        <Button className='LinkButton' onClick={this.selected}>
                            Submit Selection
                        </Button>
                    </Col>
                    <Col span={3}></Col>
                </Row>
                
                <Row>
                    <Col span={2}></Col>
                    <Col span={20}>
                        <Divider style={{backgroundColor:'black'}}></Divider>
                    </Col>
                    <Col span={2}></Col>
                </Row>

                <Row>
                    <Col span={24} style={{textAlign:'center'}}>
                        <h2>Please choose the questions you'd like to link together</h2>
                        <br></br>
                    </Col>
                </Row>

                <Row>
                    <Col span={3}></Col>
                    <Col span={8}>
                        <Select onChange={this.userSelection} defaultValue="Question 1" placeholder="Please select a question" style={{width:'100%'}}>
                            {this.UserGen()}
                        </Select>
                        <br></br>
                        <br></br>
                        <h3 className='Questions'>
                            {this.state.userQuestions[this.state.userQID].QText}
                        </h3>
                        <Select onChange={this.userOptSel} placeholder="Please select an option" style={{width:'60%'}}>
                            {this.userOptGen()}
                        </Select>
                    </Col>
                    <Col span={2}></Col>
                    <Col span={8}>
                        <Select onChange={this.therapistSelection} defaultValue="Question 1" placeholder="Please select a question" style={{width:'100%'}}>
                            {this.TherapistGen()}
                        </Select>
                        <br></br>
                        <br></br>
                        <h3 className='Questions'>
                            {this.state.therapistQuestions[this.state.therapistQID].QText}
                        </h3>
                        <Select onChange={this.therapistOptSel} placeholder="Please select an option" style={{width:'60%'}}>
                            {this.therapistOptGen()}
                        </Select>
                    </Col>
                    <Col span={3}></Col>
                </Row>

                <Row>
                    <Col span={3}></Col>
                    <Col span={18}>
                        <br></br>
                        <br></br>
                        <Button disabled={this.state.disabControl} onClick={this.submitLink} className='LinkButton'>
                            Link Options
                        </Button>
                        <p>{this.state.success}</p>
                    </Col>
                    <Col span={3}></Col>
                </Row>

                

            </Layout>
        )
    }
}
export default CrossReference