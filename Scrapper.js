// index.js

const cheerio = require("cheerio")
const axios = require("axios")

const URL = "https://internshala.com/student/old_applications?dashboard_source=recent";

const MYdata = [];


async function performScraping() {
    // downloading the target web page
    // by performing an HTTP GET request in Axios
    const axiosResponse = await axios.request({
        method: "GET",
        url: URL,
        headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    })
}

performScraping()

