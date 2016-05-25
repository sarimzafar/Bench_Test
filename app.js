'use strict';

var http = require('http');
var Promise = require('promise');
var request = require('request');

var totalTransactions = 0;
var downloadedJSONData = {};

/** Readme
 * Main Task - Completed - Total Sum - $18377.16
 *
 * Additional Task 1 - The definition of garbage is undefined - Requires clarification
 *
 * Additional Task 2 - Completed
 * commonCompanyData - Contains Data where the unique company name is the key and the collective data is inside an array*/

/**Additional Task 3 - Requires attempt
 *
 * Additional Task 4 - Requires attempt
 *                     Assuming that with each data - it means that the running data is for one company - meaning that if
 *                     X has two transactions on DAY 1 - then it should show as only one transaction (sum of both)
 **/



function getItems(page) {
    return new Promise(function(resolve) {
        var apiAddress = 'http://resttest.bench.co/transactions/' + page +'.json';
        request({url: apiAddress, json: true}, function(err, msg, result) {
            if (err) throw err;
            //console.log('Printing Result : ' + result.transactions.length);
            resolve(result);
        });
    });
}

function makeAPICall(page)
{
    return new Promise(function(resolve){
        getItems(page)
            .then(function(response)
        {
            if(page == 1)
            {
                totalTransactions = response.totalCount - response.transactions.length;
            }
            else
            {
                totalTransactions -= response.transactions.length;
            }

            downloadedJSONData[page] = response.transactions;
            resolve([totalTransactions, page]);
        })
            .catch(function(err){
                console.log('There was an error in executing the getItems function :' + err);
                throw(err);
            });
    });

}

function getAllItems(page, callback) {
    makeAPICall(page)
        .then(function(onSuccess){
            if (onSuccess[0] > 0 ) //There is data remaining to be fetched
            {
                getAllItems(onSuccess[1] + 1, callback);
            }
            else {
                callback(getTotalBalance(downloadedJSONData));
                // Once you have all the data  -- Do the operations
            }
        });
}


function getTotalBalance(apiData){
    var totalSum = 0;

    var commonCompanyData = {};
    var dailyRunningData  = {};

    for(var key in apiData)
    {
        var pageObject = apiData[key];
        for(var i = 0; i < pageObject.length; ++i)
        {
            totalSum += parseFloat(pageObject[i].Amount);

            if(commonCompanyData[pageObject[i].Company] == undefined)
            {
                commonCompanyData[pageObject[i].Company] = [pageObject[i]];
            }
            else
            {
                var arr = commonCompanyData[pageObject[i].Company];
                arr.push(pageObject[i]);
                commonCompanyData[pageObject[i].Company] = arr;
            }
        }
    }


    console.log('Total Sum = $' + totalSum + '\n');
    console.log('Length of Common Data ' + Object.keys(commonCompanyData).length + '\n'); //
}

getAllItems(1);