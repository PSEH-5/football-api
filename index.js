const express = require('express');
var bodyParser = require('body-parser')
const https = require('https');
const axios = require('axios').default;

const PORT = process.env.PORT || 3000

const app = express();
app.use(bodyParser.json())

//Football API Configurations
const HOST_URL = "https://apiv2.apifootball.com"
const API_KEY = "9bb66184e0c8145384fd2cc0f7b914ada57b4e8fd2e4d6d586adcc27c257a978"
const ACTIONS = {
    "LEAGUES": "get_leagues",
    "COUNTRIES": "get_countries",
    "STANDINGS": "get_standings"
}

async function getLeagues(leagueName, countryId){
    // Get league id from user based on league name
    // ENDPOINT: GET apiv2.apifootball.com/?action=get_leagues
    // console.log(`${HOST_URL}/?action=${ACTIONS.LEAGUES}&country_id=148&APIkey=${API_KEY}`)

    const options = {
        host: HOST_URL,
        path: `/?action=${ACTIONS.LEAGUES}&country_id=${countryId}&APIkey=${API_KEY}`,
        method: 'POST',
    }
    let url = `${HOST_URL}/?action=${ACTIONS.LEAGUES}&country_id=${countryId}&APIkey=${API_KEY}`
    // console.log(url, "League URL")
    return new Promise(resolve => {
        let r = https.get(url, (res) => {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                // console.log('BODY: ' + chunk);
                // console.log('BODY type: ' + typeof chunk);
                // console.log('BODY type: ' + typeof JSON.parse(chunk));
                // console.log(JSON.parse(chunk));
                let chunkObject = JSON.parse(chunk);
                chunkObject.forEach(league => {
                    // console.log(league);
                    if (league.league_name === leagueName) {
                        // console.log("Found matching League")
                        resolve(league.league_id)
                        // console.log("Country Matched...", countryId)
                        // returncountries.country_id;
                    }
                    else{
                        return new Promise(resolve => {
                            league_id = league.league_id;
                            resolve(null)
                        });
                    }
                });
            });
        })
    })
    return true
}

async function getCountry(country_name){
    // Get country name from country id
    // ENDPOINT apiv2.apifootball.com/?action=get_countries
    const options = {
        host: HOST_URL,
        path: `/?action=${ACTIONS.COUNTRIES}&APIkey=${API_KEY}`,
        method: 'POST',
    }
    let url = `${HOST_URL}/?action=${ACTIONS.COUNTRIES}&APIkey=${API_KEY}`
    // console.log(url);
    return new Promise(resolve => {
    let r = https.get(url, (res) => {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            // console.log('BODY: ' + chunk);
            // console.log('BODY type: ' + typeof chunk);
            // console.log('BODY type: ' + typeof JSON.parse(chunk));
            // console.log(JSON.parse(chunk));
            country_reponse = JSON.parse(chunk);
            country_reponse.forEach(countries => {
                // console.log(countries);
                if (countries.country_name === country_name) {
                    // console.log("Country Matched...", countryId)
                    // returncountries.country_id;
                    resolve(countries.country_id)
                    }
                });
            });
        })
    });

    // r.on('error', function(e) {
    //     console.log('problem with request: ' + e.message);
    // });
    
    // write data to request body
    // r.write('data\n');
    // r.write('data\n');
    // r.end();
    // console.log(r)
}

async function findStandings(leagueId, teamName, countryId){
    // Get country name from country id
    // ENDPOINT apiv2.apifootball.com/?action=get_countries
    const options = {
        host: HOST_URL,
        path: `/?action=${ACTIONS.STANDINGS}&league_id=${leagueId}&APIkey=${API_KEY}`,
        method: 'POST',
    }
    let url = `${HOST_URL}/?action=${ACTIONS.STANDINGS}&league_id=${leagueId}&APIkey=${API_KEY}`
    console.log(url)
    return new Promise(resolve => {
        var incomingData = "";
        https.get(url, (req, res) => {
            req.setEncoding('utf8');
            req.on('data', function (chunk) {
                // console.log('BODY: ' + chunk);
                // console.log('BODY type: ' + typeof chunk);
                // console.log('BODY type: ' + typeof JSON.parse(chunk));
                // console.log(JSON.parse(chunk));
                incomingData += chunk;
                
                });
            
            req.on('end', function (){
                let standings_reponse = JSON.parse(incomingData);
                // console.log(standings_reponse)
                standings_reponse.forEach(standings => {
                    // console.log(standings);
                    if (standings.team_name === teamName) {
                        // console.log("team matched Matched...", standings.team_name)
                        // returncountries.country_id;
                        let final_response = {
                            "country_id": countryId,
                            "country_name":standings.country_name,
                            "league_id": standings.league_id,
                            "league_name": standings.league_name,
                            "team_id": standings.team_id,
                            "team_name": standings.team_name,
                            "league_position": standings.overall_league_position
                        }
                        resolve(final_response)
                        }
                    });   
            })
            })
        });
}


/*
// API Structure
// POST https://host_url/football/v1/standings
// Payload:
// {
//      country_name:
//      league_name:
//      team_name:
// }
//
// Expected Output:
// {
        country_id:
        country_name:
        league_id:
        league_name:
        team_id:
        team_name:
        league_position:
// }
//
*/



app.get('/', (req, res) => {
    console.log(getLeagues())
    res.send("Done")
})
app.post('/v1/standings', async function getStandings(req, res){
    let country_name = req.body.country_name
    let team_name = req.body.team_name
    let league_name = req.body.league_name

    let countryId = await getCountry(country_name);
    let leagueId = await getLeagues(league_name,countryId)
    console.log(countryId, "country_id")
    console.log(leagueId, "leagueId")

    let standings_result = await findStandings(leagueId, team_name, countryId) 
    console.log(standings_result);
    res.send(standings_result)
})

app.listen(PORT, () => {
    console.log(`APP LISTENING ON PORT ${PORT}....`)
});
