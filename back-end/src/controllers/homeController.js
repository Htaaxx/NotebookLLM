let getHomePage = (req, res) => {
    return res.send("Hello World");
}

module.exports = {  
  getHomePage: getHomePage
};