const express = require("express");

const app = express();
app.use(express.json()); //middle ware

app.get("/", (req, res) => {
  res.send("I am learn backend ");
});


const notes= []

app.post ("/notes",(req,res) =>{
    console.log(req.body)
    notes.push(req.body)
    res.send("note created")
})

app.delete("/notes/:index", (req,res)=>{
  console.log(req.params.index)
})




app.get("/notes",(req,res)=>{
    res.send(notes)
})


app.listen(3000, () => {
  console.log("Server started on port 3000");
});
