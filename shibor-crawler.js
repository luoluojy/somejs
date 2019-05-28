/**
 * @fileoverview 爬取上海银行间同业拆放利率
 * @author CHENG十
 */


const Crawler = require("crawler");
const schedule = require('node-schedule');
const baseHref = 'http://www.shibor.org';

/**
 * @global 标志第一次爬取各银行数值时获取全部银行的value 
 */
var flag;

/**
 * 每天11点10分执行爬虫脚本
 */
const j = schedule.scheduleJob('* 10 11 * * *', function () {
    flag = true;
    iframesCrawler.queue('http://www.shibor.org/shibor/web/AllShibor.jsp');
});

/**
 * 爬取网页内iframe标签，并提取src链接地址
 */
const iframesCrawler = new Crawler({
    maxConnections: 10,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            const $ = res.$;
            const iframes = $('iframe');
            const shiborUrl = baseHref + iframes[0].attribs['src'],
                shiborbankUrl = baseHref + iframes[2].attribs['src'];
            shiborbankDataCrawler.queue(shiborbankUrl)
            shiborDataCrawler.queue(shiborUrl);
        }
        done();
    }
});

/**
 * 爬取各银行的拆放利率
 */
const shiborbankDataCrawler = new Crawler({
    maxConnections: 10,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            const $ = res.$;
            const dataRows = $($('table.shiborquxian')[0]).children();
            let type, shibor;
            for (let i = 0; i < dataRows.length; i++) {
                const rowTds = $(dataRows[i]).children();
                type = $($(rowTds)[1]).text();
                shibor = Number($($(rowTds)[2]).text());
                console.log(type, shibor);
            }
            if (flag) {
                flag = false;
                let optionValues = [];
                $("[name='LoginName']").children().each((idx, elm) => {
                    optionValues.push(elm.attribs['value']);
                });
                for (let i = 1; i < optionValues.length; i++) {
                    let shiborbankUrl = res.request.uri.href.replace(res.request.uri.query.split('&')[0].split('=')[1], optionValues[i])
                    shiborbankDataCrawler.queue(shiborbankUrl)
                }
            }

        }
        done();
    }
});

/**
 * 爬取拆放利率
 */
const shiborDataCrawler = new Crawler({
    maxConnections: 10,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            const $ = res.$;
            const dataRows = $($('table.shiborquxian')[0]).children();
            let type, shibor, bp;
            for (let i = 0; i < dataRows.length; i++) {
                const rowTds = $(dataRows[i]).children();
                type = $($(rowTds)[1]).text();
                shibor = Number($($(rowTds)[2]).text());
                bp = Number($($(rowTds)[4]).text());
                console.log(type, shibor, bp);
            }
        }
        done();
    }
});