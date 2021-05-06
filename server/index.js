var db = require('./db');
const express = require('express')
const authJWT = require("./authJwt");
const keyConfig = require("./config/key.config");
var jwt = require("jsonwebtoken");
var cors = require('cors')
var bodyParser = require('body-parser')
const app = express()
const port = 3200;
var mailer = require("nodemailer");
var Crypto = require('crypto')
var moment = require('moment')
var bcrypt = require("bcrypt")
var bodyParser = require('body-parser');
app.use(cors())

var corsOptions = {		
   origin: 'http://165.22.184.151:3000'
   //origin: 'http://localhost:3000'
 }

  
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));


/* Check if the user has taken a survey */

app.get("/checkSurveyHeader", (req, res) => {
    
  const UserID = req.query.UserID;

  db.conn.query( "SELECT SurveyID,Time_stamp FROM UserSurveyHeader WHERE UserID = ?;",[UserID],
     (err,result) => {
       if(err)
       {  
         console.log(err);
         res.send("No Data");
       }
       if(result)
       {
       res.send(result);
       console.log(result);
       }
     });
});


/* Add the survey log into the table */


app.post("/addSurveyHeader", (req, res) => {
  
  const UserID = req.body.UserID;
  const SurveyID = req.body.SurveyID;
  


  db.conn.query( "INSERT INTO UserSurveyHeader (UserID,SurveyID) VALUES (?,?);",
     [UserID,SurveyID],
     (err,result) => {

      res.send({ "status": true});
       console.log(result);
     });
});


/* Display the Survey Log  */

app.get("/displaySurveyHeader", (req, res) => {
    
  db.conn.query( "SELECT  Surveys.SurveyTitle,Surveys.BucketType,Surveys.CategoryID,Users.EmailID, Users.UserType,Users.First_Name,Users.Last_Name ,UserSurveyHeader.Time_stamp FROM StartwellDB.UserSurveyHeader JOIN StartwellDB.Users ON UserSurveyHeader.UserID = Users.UserID JOIN StartwellDB.Surveys ON UserSurveyHeader.SurveyID = Surveys.SurveyID;",
     (err,result) => {
       if(err)
       {
         console.log(err);
         res.send("No Data");
       }
       if(result)
       {
       res.send(result);
       console.log(result);
       }
     });
});

/* Addition of Questions with option to a survey in a single JSon */


app.post("/addQuestionwithOptions",(req,res) => {
  
  const SurveyID = req.body.SurveyID;
  const QuesID = req.body.QuesID;
  const QText = req.body.QText;
  const Weights = req.body.Weights;
  const Options = req.body.Options;

  console.log(req.body);
  var promise = [];
  db.conn.query("INSERT INTO StartwellDB.SQuestions (SurveyID,QuesID,QText,Weights,RespType) VALUES (?,?,?,?,'R');",[SurveyID,QuesID,QText,Weights],(err,res) =>
  {
  if(res)
  {

  for(var i = 0;i< Options.length; i++ )
  {
    console.log(Options[i]);
    promise.push( new Promise ((resolve, reject) =>(
      db.conn.query("INSERT INTO QOptions (SurveyID,QuesID, OptID,OptText) VALUES (?,?,?,?);",
      [SurveyID,QuesID,i+1,Options[i]],
      function(err, optionresult, fields){
        if(err) throw err;
        console.log(optionresult);
        resolve();
      })

)))
 } 
}


})// end of for

Promise.all(promise).then(() =>{
  res.send({"status": "Ouestions and Options Addedd"});
});



})


/* Addition of Questions with option to a survey one by one */

app.post("/addSurveyQuesOpt",(req,res) =>
{
  const SurveyID = req.body.SurveyID;
  const QuesID = req.body.QuesID;
  const QText = req.body.QText;
  const Weights = req.body.Weights;
  const OptID = req.body.OptID;
  const OptText = req.body.OptText;

  db.conn.query("INSERT INTO StartwellDB.SQuestions (SurveyID,QuesID,QText,Weights) VALUES (?,?,?,?); INSERT INTO StartwellDB.QOptions (SurveyID,QuesID,OptID,OptText) VALUES (?,?,?,?);",[SurveyID,QuesID,QText,Weights,SurveyID,QuesID,OptID,OptText],(err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      
     res.send("Questions and Answers added to the survey");

    }
  })
})
  


/* Delete a Survey Question Along with options */

app.delete("/deleteSurveyQuestion",(req,res) => {

  const SurveyID = req.query.SurveyID;
  const QuesID = req.query.QuesID;
  console.log("body",req.query)
  

  const sqlDelete = " DELETE StartwellDB.SQuestions,StartwellDB.QOptions FROM StartwellDB.SQuestions JOIN StartwellDB.QOptions ON SQuestions.SurveyID = QOptions.SurveyID AND SQuestions.QuesID = QOptions.QuesID WHERE SQuestions.SurveyID = ? AND SQuestions.QuesID = ?; "

  db.conn.query (sqlDelete,[SurveyID,QuesID],(err,result) => {
    if(err) {
    console.log(err);
    res.send({ "status": false, message: "Error while deleting "});
    }

    if(result) {
      res.send({ "status": true});
      }
}
)
})

/* Dleete a Survey with all the questions , options */

app.delete("/deleteWholeSurvey",(req,res) => {

  const SurveyID = req.query.SurveyID;
  console.log("query",req.query)

  const sqlDelete = "DELETE FROM Surveys WHERE SurveyID = ?;";

  db.conn.query (sqlDelete,[SurveyID],(err,result) => {
    if(err) {
    console.log(err);
    res.send({ "status": false, message: "Error while deleting "});
    }

    if(result) {
      res.send({ "status": true});
      }
}
)
})

/* Edit the survey Details */

app.put("/EditSurveyDetails",(req,res) => {

  const SurveyID = req.body.SurveyID;
  const SurveyTitle = req.body.SurveyTitle;
  const BucketType = req.body.BucketType;
  const CategoryID = req.body.CategoryID;



  db.conn.query("UPDATE Surveys SET SurveyTitle = ?, BucketType = ? , CategoryID = ?  WHERE SurveyID  = ? ;",[SurveyTitle,BucketType,CategoryID,SurveyID,],
  (err,result) => {

    if(err)
    {
      console.log(err)
      res.send(err);
    }
    else{
      res.send({"message" : "Details Uploaded"});
    }

  })

})


/* Display all the Survey under the User Bucket */

app.get("/displayUserSurvey",function(req,res){
  
  db.conn.query("SELECT * FROM Surveys WHERE BucketType = 'Customer' OR 'All';", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});
      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      if(result && result.length >0)
      {
        res.send(result)
      }
    }
  })
})

/* Display all the Survey under the therapist bucket */

app.get("/displayTherapistSurvey",function(req,res){
  
  db.conn.query("SELECT * FROM Surveys WHERE BucketType = 'Provider' OR 'All';", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});
      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      if(result && result.length >0)
      {
        res.send(result)
      }
    }
  })
})

/* Display all the survey in the DB */

app.get("/displayingAllSurveys",function(req,res){
  
  db.conn.query("SELECT * FROM Surveys;", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});
      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      if(result && result.length >0)
      {
        res.send(result)
      }
    }
  })
})

/* When given a survey Id , display the details */


app.get("/displaySurveyDetails",function(req,res){
  const surveyId = req.query.surveyId;
  db.conn.query("SELECT * FROM Surveys WHERE SurveyID = ?;",surveyId, (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});
      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      if(result && result.length >0)
      {
        res.send({ status: true, surveyId : result[0].SurveyID,
          surveyTitle : result[0].SurveyTitle,
          NoQues: result[0].NoQues,
          OptDesc: result[0].OptDesc,
          CategoryID: result[0].CategoryID,
          SurveyStatus: 'A'
        })
      }
    }
  })
})

/* Add cross Reference into the table which decides the matching criteria */

app.post("/addCrossReference", (req, res) => {
  
  const SurveyID_Customer = req.body.SurveyID_Customer;
  const SurveyTitle_Customer = req.body.SurveyTitle_Customer;
  const QuesID_Customer = req.body.QuesID_Customer;
  const QText_Customer = req.body.QText_Customer;
  const OptID_Customer = req.body.OptID_Customer;
  const OptText_Customer = req.body.OptText_Customer;
  const SurveyID_Provider = req.body.SurveyID_Provider;
  const SurveyTitle_Provider = req.body.SurveyTitle_Provider;
  const QuesID_Provider = req.body.QuesID_Provider;
  const QText_Provider = req.body.QText_Provider;
  const OptID_Provider = req.body.OptID_Provider;
  const OptText_Provider = req.body.OptText_Provider;


  db.conn.query( "INSERT INTO CrossReference (SurveyID_Customer,SurveyTitle_Customer,QuesID_Customer,QText_Customer,OptID_Customer,OptText_Customer,SurveyID_Provider,SurveyTitle_Provider,QuesID_Provider,QText_Provider,OptID_Provider,OptText_Provider) VALUES (?,?,?,?,?,?,?,?,?,?,?,?);",
     [SurveyID_Customer,SurveyTitle_Customer,QuesID_Customer,QText_Customer,OptID_Customer,OptText_Customer,SurveyID_Provider,SurveyTitle_Provider,QuesID_Provider,QText_Provider,OptID_Provider,OptText_Provider],
     (err,result) => {

      res.send({ "status": true});
       console.log(result);
     });
});

/* Display only the surveyID */

app.get("/displaySurveyID",function(req,res){


  db.conn.query("SELECT SurveyID  FROM Surveys", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);

    }
  })
})

/* Display the Survey Title */

app.get("/displaySurveyTitle",function(req,res){


  db.conn.query("SELECT SurveyTitle  FROM Surveys", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);

    }
  })
})

/* Display all the Categories from the DB */

app.get("/displayCategoryID",function(req,res){


  db.conn.query("SELECT CategoryID  FROM SCategories", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);

    }
  })
})

/* Display all the distinct quesID */

app.get("/displayQuesID",function(req,res){


  db.conn.query("SELECT distinct QuesID FROM SQuestions;", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);

    }
  })
})

/* Display all Response type of questions */

app.get("/DisplayRespType",function(req,res){


  db.conn.query("SELECT distinct RespType FROM SQuestions;", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);

    }
  })
})

/* Display the CrossReference table */

app.get("/displayCrossReference",function(req,res){



  db.conn.query("SELECT SurveyTitle_Customer,QuesID_Customer,QText_Customer,OptText_Customer,SurveyTitle_Provider,QuesID_Provider,QText_Provider,OptText_Provider FROM CrossReference;",(err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      
     res.send(result);

    }
  })
})

/* Display all the questions in all the survey */

app.get("/displaySQuestions",function(req,res){

  const SurveyID = req.query.SurveyID;

  db.conn.query("SELECT * FROM SQuestions join Surveys on Surveys.SurveyID = SQuestions.SurveyID WHERE SQuestions.SurveyID = ?",SurveyID, (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);

    }
  })
})

/* Display all Cateogey under a particular Bucket */

app.get("/CateogryUnderEachBucket",function(req,res){

  const BucketType = req.query.BucketType;

  db.conn.query("SELECT CategoryID FROM SCategories WHERE BucketType = ?", BucketType, (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);

    }
  })
})

/* All the survey under each bucket */

app.get("/SurveyUnderEachBucket",function(req,res){

  const BucketType = req.query.BucketType;

  db.conn.query("SELECT * FROM Surveys WHERE BucketType  = ?", BucketType,(err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);

    }
  })
})


/* All the Survey under each cateogry */

app.get("/SurveyUnderEachCateogry",function(req,res){

  const CategoryID = req.query.CategoryID;

  db.conn.query("SELECT * FROM Surveys WHERE CategoryID = ?", CategoryID,(err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);

    }
  })
})

/* Diplay all the user and therapist that are linked */

app.get("/displayLinkedUser",function(req,res){

  const UserID = req.query.UserID;
  
  db.conn.query("SELECT LinkedUserID FROM UserRelationships WHERE UserID = ? ;",UserID,(err,result) =>
  {
    if(err)
    {
      console.log(err);
      res.send({err:err});
      res.send({status : false, message :"Internal error"});
    }
    else
    {
      // console.log(result);
       console.log(result.length);
       var i;
       var optionArray = [] ;
        var promise = [];
        result.map((item) => {
         console.log(  item['LinkedUserID']);
          promise.push( new Promise ((resolve, reject) =>(
            db.conn.query("SELECT EmailID , First_Name, Last_Name FROM Users WHERE UserID ="+item['LinkedUserID']+" ;",
            function(err, optionresult, fields){
              if(err) throw err;
              console.log(optionresult.length);
              if(optionresult.length>0) {
                for(var j=0;j<optionresult.length;j++) {
                optionArray.push({"EmailID" : optionresult[j].EmailID, "First_Name":optionresult[j].First_Name, "Last_Name":optionresult[j].Last_Name});
                }
                item['User'] = optionArray;
                optionArray = [] ;
                console.log("*** " + JSON.stringify(item));
              } else {
                console.log("error");
              }
              resolve();
            })

      )))});
      Promise.all(promise).then(() =>{
        res.send(result);
      });
    
    }

    }
  )
})

/* Display all the categories under all the buckets */


app.get("/displaySCategories",function(req,res){

  db.conn.query("SELECT * FROM SCategories", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);

      /*
       if(result && result.length >0)
      {
        res.send({ status: true, UserID: result[0].UserID,
          email: result[0].email,
          subject: result[0].subject,
          message: result[0].message,
         
        })
      }  
*/

    }
  })
})

/* Set the user status to active , inactive or blocked */

app.put("/updateUserStatus",(req,res) => {

  const UserID = req.body.UserID;
  const Current_Status = req.body.Current_Status
  const UserType = req.body.UserType

  db.conn.query("UPDATE Users SET UserType=? ,Current_Status = ? WHERE UserID  = ? ;",[UserType,Current_Status,UserID],
  (err,result) => {

    if(err)
    {
      console.log(err);
      res.send(err);
    }
    else{
      res.send({"message" : "Status Changed"});
    }

  })

})

/* Change the conatctUs to resolved or unresolved */

app.put("/EditContactUs",(req,res) => {

  const status = req.body.status;
  const SNo = req.body.SNo;

  db.conn.query("UPDATE contactUs SET status = ? WHERE SNo = ? ;",[status,SNo],
  (err,result) => {

    if(err)
    {
      console.log(err);
      res.send(err);
    }
    else {
      res.send({"message" : true});
    }

  })

})
/* Change the conatctUs to resolved or unresolved */


app.put("/resolveContactUs",(req,res) => {

  const SNo = req.body.SNo;


  db.conn.query("UPDATE contactUs SET status = 'Resolved' WHERE  SNo = ? ;",[SNo],
  (err,result) => {

    if(err)
    {
      console.log(err);
      res.send(err);
    }
    else{
      res.send({"message" : "Resolved"});
    }

  })

})

/* Display all the Contact Us   */

app.get("/DisplayContactUs",function(req,res){

  db.conn.query("SELECT * FROM contactUs", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);

      /*
       if(result && result.length >0)
      {
        res.send({ status: true, UserID: result[0].UserID,
          email: result[0].email,
          subject: result[0].subject,
          message: result[0].message,
         
        })
      }  
*/

    }
  })
})

/* Used to block a particular User  */

app.put("/blockUser",(req,res) => {

  const UserID = req.body.UserID;


  db.conn.query("UPDATE Users SET Current_Status = 'Blocked' WHERE  UserID = ? ;",[UserID],
  (err,result) => {

    if(err)
    {
      console.log(err);
      res.send(err);
    }
    else {
      res.send({"message" : "User Blocked"});
    }

  })

})

/* Gets all the user registerd in ths system  */

app.get("/displayAllUsers",function(req,res){

  db.conn.query("SELECT UserID,UserType,First_Name, Last_Name, Current_Status, LicenseID FROM Users", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      res.send(result);
      /*
      if(result && result.length >0)
      {
        res.send({ status: true, UserID: result[0].UserID,
          UserType:  result[0].UserType,
          First_Name: result[0].First_Name,
          Last_Name: result[0].Last_Name,
          DOB: result[0].DOB,
          Sex : result[0].Sex,
          LicenseID : result[0].LicenseID,
          BucketType: result[0].BucketType,
          Current_Status : result[0].Current_Status,
          Subscription : result[0].Subscription,
        })
      }  
      */

    }
  })
})

/*  Edit the options of a particular questions */

app.put("/EditOption",(req,res) => {

  const OptID = req.body.OptID;
  const OptText = req.body.OptText;
  const SurveyID = req.body.SurveyID;
  const QuesID = req.body.QuesID;

  db.conn.query("UPDATE QOptions SET  OptText = ? WHERE SurveyID = ? and QuesID = ? and OptID = ?;",[OptText,SurveyID,QuesID,OptID],
  (err,result) => {

    if(err)
    {
      console.log(err);
      res.send(err);
    }
    else{
      res.send({"message" : true});
    }

  })

})


/* Edit survey details of a particular survey  */

app.put("/EditSurvey",(req,res) => {

  const SurveyID = req.body.SurveyID;
  const SurveyTitle = req.body.SurveyTitle;
  const NoQues = req.body.NoQues;
 

  db.conn.query("UPDATE SQuestions SET SurveyTitle = ? AND NoQues = ? WHERE SurveyID = ?;",[SurveyTitle,NoQues,SurveyID],
  (err,result) => {

    if(err)
    {
      console.log(err);
      res.send(err);
    }
    else{
      res.send({"message" : true});
    }

  })

})

/*  Edit the Question text and weights */

app.put("/EditQues",(req,res) => {

  const QText = req.body.QText;
  const SurveyID = req.body.SurveyID;
  const QuesID = req.body.QuesID;
  const Weights = req.body.Weights;

  db.conn.query("UPDATE SQuestions SET QText = ?, Weights = ? WHERE SurveyID = ? and QuesID = ?;",[QText,Weights,SurveyID,QuesID],
  (err,result) => {

    if(err)
    {
      console.log(err);
      res.send(err);
    }
    else {
      res.send({"message" : true});
    }

  })

})

/* Delete a question from a survey  */

app.delete("/deleteQues",(req,res) => {

  const SurveyID = req.body.SurveyID;
  const QuesID = req.body.QuesID;

  const sqlDelete = "DELETE FROM SQuestions WHERE SurveyID = ? AND QuesID = ?;";

  db.conn.query (sqlDelete,[SurveyID,QuesID],(err,result) => {
    if(err) {
    console.log(err);
    res.send({ "status": false, message: "Error while deleting "});
    }

    if(result) {
      res.send({ "status": true});
      }
}
)
})

/*  Once the User takes the survey , store the responses in the system  */

app.post("/saveUserResponse",[authJWT.verifyToken],(req,res) => {
  console.log(req.body);
  const UserID = req.userId;
  const UserType = req.userType;
  const surveyID = req.body.SurveyID;
  const UserResponse = req.body.UserResponse;

  var promise = [];
  for(var i = 0;i< UserResponse.length; i++ )
  {
    console.log(UserResponse[i].QuesID + " ID " + UserResponse[i].optionId );

    promise.push( new Promise ((resolve, reject) =>(
      db.conn.query("INSERT INTO UserResponses(UserID,UserType,SurveyID,QuesID,OptID,Response) VALUES (?,?,?,?,?,?);",
      [UserID,UserType,surveyID,UserResponse[i].QuesID,UserResponse[i].optionId ,UserResponse[i].OptionText] ,
      function(err, optionresult, fields){
        if(err) throw err;
        console.log(optionresult);
        resolve();
      })

)))
 } // end of for


Promise.all(promise).then(() =>{
  res.send({"status": true});
});


})

/* Post email who register for newsletter  */

app.post("/newsletter", [authJWT.verifyToken],(req, res) => {
  console.log(req.body);
  const email = req.body.email;
  db.conn.query( "INSERT INTO Newsletter (email) VALUES (?);",
     [email],
     (err,result) => {

      res.send({ "status": true});
       console.log(result);
     });
});

/*  Display all the user bucket in the system  */

app.get("/displayUserbucket",function(req,res){

  db.conn.query("SELECT * FROM Bucket", (err,result) => 
  {
    if(err)
    {
      console.log(err);
      res.send({err: err});

      res.send({status : false, message :"Internal error"});
    }
    else
    {
      console.log(result);
      if(result && result.length >0)
      {
        res.send(result);
      }     
    }
  })
})

/*  Add a new  Bucket  */

app.post("/addBucket",(req,res) => 
    {
      const BucketType = req.body.BucketType;
      const BucketDesc = req.body.BucketDesc;
     
      db.conn.query( "INSERT INTO UserBuckets (BucketType,BucketDesc) VALUES (?,?)",
         [BucketType,BucketDesc],
         (err,result) => {
            if(err)
            {res.send({ "message": err});
            }
            if(result) {
            res.send({ "status": true});
            }
         });
      });

/* Add a new Category  */      

      app.post("/addSCategories", (req,res) => 
      {
        const CategoryID = req.body.CategoryID;
        const BucketType = req.body.BucketType;
        const CatDesc = req.body.CatDesc;
       
      console.log(db.conn)
      
        db.conn.query( "INSERT INTO SCategories (CategoryID,BucketType,CatDesc) VALUES (?,?,?)",
           [CategoryID,BucketType,CatDesc],
           (err,result) => {
              if(err)
              {res.send({ "message": err});
              }
              if(result) {
              res.send({ "status": true});
              }
           });
        });

 /*  add a new survey   */       

      app.post("/addSurvey",(req,res) => 
      {
        const SurveyTitle = req.body.SurveyTitle;
        const CategoryID = req.body.CategoryID;
        const BucketType = req.body.BucketType;
       
      
      
        db.conn.query( "INSERT INTO Surveys (SurveyTitle,CategoryID,BucketType) VALUES (?,?,?); SELECT SurveyID FROM Surveys WHERE SurveyTitle = ?;",
           [SurveyTitle,CategoryID,BucketType,SurveyTitle],
           (err,result) => {
              if(err)
              {res.send({ "message": err});
              }
              if(result) {
        
            console.log(result);
            res.send(result[1]);
          }

        }
              
        )}
      );


      /*  Add a new survey question */
           
        app.post("/addSurveyQuestion", (req,res) => 
      {

        const SurveyID = req.body.SurveyID;
        const QuesID = req.body.QuesID;
        const QText = req.body.QText;
        const RespType = req.body.RespType;
      
      
        db.conn.query( "INSERT INTO SQuestions (SurveyID,QuesID,QText,RespType) VALUES (?,?,?,?)",
           [SurveyID,QuesID,QText,RespType],
           (err,result) => {
              if(err)
              {res.send({ "message": err});
              }
              if(result) {
              res.send({ "status": true});
              }
           });
        });
/* add options to a question  */

        app.post("/addQOptions",(req,res) => 
      {

        const SurveyID = req.body.SurveyID;
        const QuesID= req.body.QuesID;
        const OptID = req.body.OptID;
        const OptText = req.body.OptText;
        
    
      
         db.conn.query( "INSERT INTO QOptions (SurveyID,QuesID,OptID,OptText) VALUES (?,?,?,?);",
           [SurveyID,QuesID,OptID,OptText],
           (err,result) => {
              if(err)
              {res.send({ "message": err});
              }
              if(result) {
              res.send({ "status": true});
              }
           });
           
        });
  
/*  Login API  */


        app.post('/user/login', function(request, response) {
          console.log(request.body)
          var EmailID = request.body.user.email;
          var password = request.body.user.password;
          console.log(EmailID,password)
          if (EmailID && password) {
        // check if user exists
            db.conn.query('SELECT * FROM Users WHERE EmailID = ? AND Pass = ? ', [EmailID, password], function(error, results, fields) {
              if(error)
              {
                 console.log("failed");
                 response.send({
                 "code":400,
                 "failed":"error ocurred"
              });
              } 
              console.log("results=",results);
              if (results.length > 0) {
                console.log(results[0].UserID);
                var token = jwt.sign({ id: results[0].UserID,type:results[0].UserType}, keyConfig.secret, {
                  expiresIn: 500 // 86400 - 24 hours
                  });
                  var UserType=results[0].UserType
                  var UserID=results[0].UserID
                  var First_Name=results[0].First_Name
                  var Last_Name=results[0].Last_Name
                 response.send({
                        "code":200,
                        "success":"login sucessful","token":token,"UserType":UserType,"UserID":UserID,"First_Name":First_Name,"Last_Name":Last_Name});
            } else 
              {
                response.send({
                  "code":204,
                  "success":'Incorrect EmailID and/or Password!'});
              }      
              response.end();
            });
          } 
          else {
            response.send({
              "code":210,
              "success":'Please Email ID does not Exist!'
              });
            response.end();
          }
        });
        app.post('/user/signup', function(req,res){
          console.log(req.body)
          var data = {
            "First_Name":req.body.user.firstname,
            "Last_Name":req.body.user.lastname,
            "EmailID":req.body.user.email,
            "Pass":req.body.user.password,
            "UserType":req.body.user.userType,
            "Current_Status":req.body.user.Current_Status,
            "LicenceID":req.body.user.LicenceID,
          }
           const SALT_ROUND = 12
           db.conn.query("SELECT COUNT(*) As total from Users where EmailID = ?;",
           data.EmailID, function(error,results,fields){
             if(error){
              console.log(error)
              res.send({
                "code":400,
              "Status":"error ocurred"
              })
             }
             else if(results[0].total>0){
               res.send({
                 "code" : 210,
                 "Status" : "Email Already exists"
               })
             }
             else {
              const token = Crypto.randomBytes(30).toString('hex')
              var tokenexpires = new Date()
              console.log(db.conn.escape(tokenexpires))
               //data.Password = hashedPassword
               var sql = "INSERT INTO Users (First_Name, Last_Name, EmailID, Pass, UserType, LicenseID, Current_Status, resetPasswordToken, resetPasswordTokenExpires) values (?, ?, ?, ?, ?, ?, ?, ?, ?)"
               db.conn.query(sql,[data.First_Name, data.Last_Name, data.EmailID, data.Pass, data.UserType, data.LicenceID , data.Current_Status, token, tokenexpires] , function(error,results,fields){
                console.log(req.body);
                if(error){
                  console.log(error)
                  res.send({
                    "code":400,
                  "failed":"error ocurred"
                  })
                }
                else{
                  console.log("fv");
                  res.send({
                  "code":200,
                  "success":"user registered sucessfully"});
                }
              })
             }
           })
        })

/* Get details of the User when JWT is passed  */

 app.get("/profiledetails",[authJWT.verifyToken],(req, res) => {

        const userid = req.userId;
        //console.log(username);
        //res.send({message: username});
        console.log("**Z");
        console.log(userid);
    
        
      
        db.conn.query("SELECT UserId, emailID,First_Name, Last_Name, DOB, Sex, LicenseID,pass from Users where UserID = ?", userid,
        (err,result) => {
          if(err)
          {
            console.log(err);
            res.send({err: err});
    
            res.send({ status : false, message : "Internal error"});
          }
          else
          {
            console.log(result);
            if (result && result.length > 0) {
            res.send({ status: true, email: result[0].emailID,First_Name: result[0].First_Name, 
              lastname : result[0].Last_Name,
              dob : result[0].DOB,
              sex : result[0].Sex,
              LicenseID : result[0].LicenseID,
              pass : result[0].pass,
              userid:result[0].UserId

            });
            }
            else {
              res.send({ status : false, message : "Profile doesnt exist"});
            }
          }
        }
        )
      });
      
/* Delete a user from the system  */

  app.delete("/Userdelete",(req,res) => {

        const UserID = req.query.UserID;
        console.log(req.query)
        const sqlDelete = "DELETE FROM Users WHERE UserID = ?";
    
        db.conn.query (sqlDelete,UserID, (err,result) => {
          if(err) {
          console.log(err);
          res.send({ "status": false, message: "Error while delete DB"});
          }
      
          if(result) {
            res.send({ "status": true});
            }
      }
      )
    })
    


app.delete("/profiledelete", [authJWT.verifyToken],(req,res) => {
        const userid = req.userId;
    
    
        const sqlDelete = "DELETE FROM Users WHERE UserID = ?";
    
        db.conn.query (sqlDelete,userid, (err,result) => {
          if(err) {
          console.log(err);
          res.send({ "status": false, message: "Error while delete DB"});
          }
      
          if(result) {
            res.send({ "status": true});
            }
      }
      )
    })
    
/* Change Personal Details of the User  */

    app.put("/profileupdate" , [authJWT.verifyToken],(req,res) =>
    {

      const userid = req.userId;
      const EmailID = req.body.EmailID;
      const Pass = req.body.Pass;
      const dob = req.body.dob;
      const sex = req.body.sex;
      const fname = req.body.fname;
      const lname = req.body.lname;
      const LicenseID = req.body.LicenseID;
      const Current_Status = req.body.Current_Status;
      
     

 const sqlUpdate = "UPDATE  Users SET   EmailID = ?, Pass = ? , dob = ?, sex = ? , First_Name = ?,  Last_Name = ? , LicenseID = ?, Current_Status = ? where UserID = ? ";
      db.conn.query(sqlUpdate,[EmailID,Pass,dob,sex,fname,lname,LicenseID,Current_Status,userid], (err,result) =>
      {
        if(err) {
        console.log(err);
        res.send({ "status": false, message: "Error while updating DB"});
        }
    
        if(result) {
          res.send({ "status": true});
          }
    
      })
    })
    
    /*  Write a contact us request */


    app.post("/contactUs", (req,res) => 
    {
      const email = req.body.email;
      const subject = req.body.subject;
      const mes = req.body.mes;
     
      db.conn.query( "INSERT INTO contactUs (email, subject, message,status) VALUES (?,?,?,'Unresolved')",
         [email,subject,mes],
         (err,result) => {
            if(err)
            {res.send({ "message": err});
            }
            if(result) {
            res.send({ "status": true});
            }
         });
      });


           /* Display all the survey in a system   */

app.get("/displayAllSurvey",function(req,res){

        db.conn.query("SELECT * FROM Surveys", (err,result) => 
        {
          if(err)
          {
            console.log(err);
            res.send({err: err});

            res.send({status : false, message :"Internal error"});
          }
          else
          {
            console.log(result);
            if(result && result.length >0)
            {
             res.send(result);
             /* res.send({ status: true, surveyId : result[0].SurveyID,
                surveyTitle : result[0].SurveyTitle,
                NoQues: result[0].NoQues,
                OptDesc: result[0].OptDesc,
                CategoryID: result[0].CategoryID,
                SurveyStatus: 'A'

                */
             
            }
            
          }
        })
      })
/*  when survey Id is passed display question and options */

	 app.get("/surveyQandOpt",function(req,res){

        const surveyId = req.query.surveyId;
        
        db.conn.query("SELECT * FROM SQuestions WHERE SurveyID = ? ;",surveyId,(err,result) =>
        {
          if(err)
          {
            console.log(err);
            res.send({err:err});
            res.send({status : false, message :"Internal error"});
          }
          else
          {
            // console.log(result);
             console.log(result.length);
             var i;
             var optionArray = [] ;
              var promise = [];
              result.map((item) => {
               console.log(  item['SurveyID'] + "  " + item['QuesID']);
                promise.push( new Promise ((resolve, reject) =>(
                  db.conn.query("SELECT OptID , OptText FROM QOptions WHERE SurveyID ="+item['SurveyID']+"  and QuesID ="+item['QuesID']+" ;",
                  function(err, optionresult, fields){
                    if(err) throw err;
                    console.log(optionresult.length);
                    if(optionresult.length>0) {
                      for(var j=0;j<optionresult.length;j++) {
                      optionArray.push({"optionId" : optionresult[j].OptID, "OptionText":optionresult[j].OptText});
                      }
                      item['options'] = optionArray;
                      optionArray = [];
                      console.log("*** " + JSON.stringify(item));
                    } else {
                      console.log("error");
                    }
                    resolve();
                  })

            )))});
            Promise.all(promise).then(() =>{
              res.send(result);
            });
          
          }

          }
        )
      })

/* Display options for a question  */

 app.get("/surveyOptions", function(req,res){

        const SurveyID = req.query.SurveyID;
        const QuesID = req.query.QuesID;

        db.conn.query("SELECT OptID , OptText FROM QOptions WHERE  SurveyID = ? AND QuesID = ? ;",[SurveyID,QuesID],(err,result) =>
        {
          if(err)
          {
            console.log(err);
            res.send({err:err});
            res.send({status : false, message :"Internal error"});
          }
          else
          {
            console.log(result);
            res.send(result);
          }
        }
        )

      })

/*  Forgot password */

app.post('/user/forgotpassword',function(req, res){
    var data = {
        
      "EmailID":req.body.email,
        }
     console.log(req.body.email); 
     console.log("DB")  
     db.conn.query(`SELECT * FROM Users where EmailID='${req.body.email}'`,
     data.Email, function(error,results,fields){
        console.log(req)
        if(error){
            console.log(error)
            res.send({
                "code":400,
            "Status":"error ocurred"
            })
          }
        else if(results.length == 0){
            console.log("no results")
            
            res.send({
                "code": 210,
                "Status" : "EmailID Not recognized"
            })
        }
        else{
            const crypto=require('crypto');
            const token = crypto.randomBytes(30).toString('hex')
            var resetPasswordTokenExpires = new Date()
            console.log(db.conn.escape(resetPasswordTokenExpires))
            var t = req.body.email
            var sql = `Update Users SET resetPasswordToken = '${token}', resetPasswordTokenExpires = '${resetPasswordTokenExpires}' Where EmailID = '${req.body.email}'`
            db.conn.query(sql,[token,resetPasswordTokenExpires,t],function(error,result,fields){
                if(error){
                    console.log(error)
                    res.send({
                        "code":400,
                    "failed":"error ocurred"
                    })
                }
                else{
                    var nodemailer = require('nodemailer');
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: 'mystartwell611@gmail.com',
                          pass: 'Kingsmourne12'
                        }
                    });
                      var mailOptions = {
                        from: 'mystartwell611@gmail.com',
                        to: req.body.email,
                        subject: 'Link To Reset Password',
                        text:'You are recieving this email because you have requested to reset the password.\n'
                        +'Please click the below link\n\n'+
                        //'http://localhost:3000/ResetPassword?token='+token
                        'http://165.22.184.151:3000/ResetPassword?token='+token
                      };

                      transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                        }
                      });
                      res.send({
                
                        "code":200,
                            "success":"Email Sent Successfully"
                    });

                }
            })
            
        }
     })

})

/*  Reset Password  */

app.get('/user/resetpassword', cors(corsOptions),function(req,res){
    console.log("In re-setpassword",req.query)
    var data = {
        "resetPasswordToken" : req.query.resetPasswordToken,
    }
    console.log(data.resetPasswordToken)
    db.conn.query(`SELECT * from Users where resetPasswordToken = '${req.query.resetPasswordToken}'`,
    data.resetPasswordToken,function(error,results,fields){
        console.log("query result",results)
        var d = new Date()
        console.log("token expires date value",d,"  ",new Date(results[0].resetPasswordTokenExpires))
        console.log("time value", (d -new Date(results[0].resetPasswordTokenExpires)))
        if(error){
            res.send({
                "code":400,
                "Status":"error occured"
            })
        }
        else if(((d - new Date(results[0].resetPasswordTokenExpires)<=360000))){
            //res.setHeader("Access-Control-Allow-Origin","*")
            //res.redirect('http://localhost:3000/ResetPassword')
            res.send({

                "code" : 200,
                "Status":"reset link OK",
                results
            })
            
        }
        else{
            res.send({
                "code" : 210,
                "Status" : "reset link expired"
            })
        }
    })

})


/* Update Password  */

app.put('/user/updatepassword', function(req,res)
{
    var data = {
       
      "EmailID":req.body.email,
       "Pass":req.body.password
    
        }
      const SALT_ROUND = 12
      let hashedPassword = bcrypt.hashSync(data.Pass,SALT_ROUND)
        db.conn.query(`Update Users SET Pass = '${req.body.password}' Where EmailID ='${req.body.email}'`,
        [hashedPassword,data.EmailID],function(error,results,fields){
            console.log(data.EmailID)
            console.log(hashedPassword)
            console.log(req.body.password)
            if(error){
                console.log(error);
                res.send({
                    "code":400,
                    "Status":"error occured",
                })
            }
            else{
                res.send({
                    "code":200,
                    "Status" : "Password updated successfully",
                })
            }
        })

})

/* Response pulled for Maching algorithm  */

app.get('/user_response', function(request, response) {
  let scoreMap = new Map();
  let list1=[]
  let surveyidlist=[]
  console.log("body",request.body)
  console.log("query",request.query)
  var data = {
    "UserID" : request.query.UserID,
    
  }
  
  db.conn.query(`select distinct SurveyID from UserResponses where UserID = '${request.query.UserID}'`,
    function (error0, res0, fields) 
    {

      if (error0) {
        console.log("failed");
        return response.send(error0)
      } else {
        console.log("selecting distint survey ID",res0);
        surveyidlist=res0;
     }

    console.log(data.UserID)
    promise = [];
    resultArray = [];
    totalweight=0
   // for (var a=0; a<surveyidlist.length; a++){
    res0.map((item) => { 
      console.log(request.query.UserID, item['SurveyID'])
    promise.push( new Promise ((resolve, reject) =>(
     // check if user exists
    db.conn.query(`select * from UserResponses A
    join CrossReference B on A.SurveyID=B.SurveyID_Customer
    and A.QuesID=B.QuesID_Customer and A.OptID=B.OptID_Customer join SQuestions C on A.SurveyID=C.SurveyID
    and A.QuesID=C.QuesID where UserID = '${request.query.UserID}' and SurveyID_Customer = '${item['SurveyID']}'`, function(error, results, fields)
       {
         console.log("error",error)
          if(error)
          {	  console.log("failed");
              //response.send("Failed");
          
           }
          else
          {
            list1=[];
            totalweight=0
            //console.log("outside")
            console.log(results.length)
            if (results.length > 0)
            {
              for(var i=0;i<results.length;i++)
              {
               totalweight=totalweight+results[i].Weights
              }
             console.log(" ttl weight",totalweight)
              resultArray = results
              console.log('*******' + results);
            }
          }
          // Resolve Db response
          resolve(JSON.parse(JSON.stringify(results)));
  }) // End of DB qurey

//)))
)))});

Promise.all(promise).then((values) =>{
  console.log("*********Promise one ");

 data = values[0];
 var type = 'Provider';
  promise1 = [];
 
 data.map((item) => { 
 promise1.push( new Promise ((resolve, reject) =>(
 db.conn.query(`select distinct EmailID, Weights from UserResponses A join SQuestions B on A.SurveyID = B.SurveyID and A.QuesID = B.QuesID join Users C on A.UserID = C.UserID where A.UserType = '${type}' and A.SurveyID='${item['SurveyID_Provider']}' and A.QuesID='${item['QuesID_Provider']}' and A.OptID='${item['OptID_Provider']}'`, function(error2, results2, fields2)
 {
  list1=[]
   
   
 if(error2)
 {
   console.log("failed");
   return response.send("failed");
 }
 else
 {
     if (results2.length > 0)
   {
      //console.log("In the score map")
    
        for (var c=0; c<results2.length; c++){
          console.log("results2.length",results2[c].EmailID)
          console.log(scoreMap.has(results2[c].EmailID))
            if (scoreMap.has(results2[c].EmailID))
            {
              //console.log("Inside if of map")
              scoreMap.set(results2[c].EmailID, scoreMap.get(results2[c].EmailID) + results2[c].Weights/totalweight*100)
              //console.log('Score Map in inside: ', scoreMap)
            }
            else{
            //console.log("Inside else of map")
            scoreMap.set(results2[c].EmailID , (results2[c].Weights/totalweight*100))
            //console.log('Score Map in else: ', scoreMap)
            }
        }
        console.log(' Printing Score Map in 1628: ', scoreMap)
        //response.send(scoreMap);
    }
    
     
    scoreMap[Symbol.iterator] = function* () {
        yield* [...this.entries()].sort((a, b) => b[1] - a[1]);
      }
    
      for (let [key, value] of scoreMap) 
      {
        // console.log(list1.length)
        if(list1.length<=4)
        {
          list1.push(key,value)
        }
        
      }
    
      console.log('Final list',list1);
      resolve(list1);
  }  

 }
 ))))});

 Promise.all(promise1).then((values) =>{
  console.log(values);
   response.send(values);
 }); //End of promise 2

//End of promise 1
});

});
});












      
    



app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})