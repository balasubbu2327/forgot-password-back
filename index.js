import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import { getuser,passtokenset,getUserpasstoken,hashingpassword,updateuserpassDetails } from "./helper.js";
import randomstring from "randomstring";
import nodemailer from "nodemailer";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
app.use(express.json());
app.use(cors());
async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("database is connected");
  return client;
}

export const client = await createConnection();

app.get("/", function (req, res) {
  res.send("Server Started");
});
app.post("/forgotpassword", async function (req, res) {
  try {
    let randomString = randomstring.generate();
    const email = req.body.email;
    const isuserexist = await getuser(email);
    if (!isuserexist) {
      res.status(401).send({ error: "Invalid credentials" });
    } else {
        let transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "e3640a19473a56",
              pass: "8c72472b0a0da3",
            },
          });
          //Mail options
          let mailOptions = {
            from: "nodemailbalasubbu2327@gmail.com",
            to: email,
            subject: "Reset Password - BrandFP",
            html: `<h4>Hello,</h4><p>We've received a request to reset the password for the AdminFP 
            account. You can reset the password by clicking the link below.
          <a href=${process.env.FRONTEND_URL}/${randomString}>click to reset your password</a></p>`,
          };
          //Send mail
          transporter.sendMail(mailOptions, async (err, data) => {
            if (err) {
              res.status(401).send({ error: "email not send" });
            } else {
             const ispasstoken = await passtokenset(email, randomString);
              
              res
                .status(200)
                .send({
                  msg: "email sended successfully",
                
                });
            }
          });
     
    }
  } catch (e) {
    res.status(500).send({ error: "interval error" });
  }
});
app.post("/resetpassword", async function (req, res) {
    try {
      const pass_token = req.body.pass_token;
      const password = req.body.password;
      const confirmpassword = req.body.confirmpassword;
      const isuserpasstokenexist = await getUserpasstoken(pass_token);
      if (!isuserpasstokenexist) {
        res.status(401).send({ error: "invalid credentials" });
      } else {
        if (password === confirmpassword) {
          const hashpass = await hashingpassword(password);
  
          const ispasstoken = await updateuserpassDetails(pass_token, hashpass);
  
          res.status(200).send({ msg: "password set successfully" });
        } else {
          res.status(200).send({ error: "confirmed password not match" });
        }
      }

  
   
    } catch (error) {
      res.status(500).send({ error: "interval error" });
    }
  });

app.listen(PORT, console.log("Server Started"));
