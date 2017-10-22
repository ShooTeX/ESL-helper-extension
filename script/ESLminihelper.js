// ==UserScript==
// @name       	ESL MiniHelper
// @description Based on meric's version and adapted to the new website with some improvements: adds an admin_match link directly in the bracket page, also contestant seeds are visible in all rounds; on league results page got rid of the annoying row onclick plus the last column now has a link to the corresponding admin_match
// @include    	https://play.eslgaming.com/*
// @version    	2.0.4
// @updateURL   http://esl.kem.zone/esladminmatch.user.js
// @downloadURL http://esl.kem.zone/esladminmatch.user.js
// @grant		none
// @copyright  	2017, meric, K.Kemzura
// ==/UserScript==

(function() {
    'use strict';

    class Page{

        static isAdminMatch(){
            return window.location.href.indexOf("/admin_match/") > -1;
        }

        static isBracket(){
            return (window.location.href.indexOf("/rankings/") > -1 && $(".league--header .description").text().indexOf("Cup") > -1);
        }

        static isLeagueResults(){
            return (window.location.href.indexOf("/results/") > -1 && $(".league--header .description").text().indexOf("League") > -1);
        }

    }

    class LeagueResults{

        static fixTables(){
            $("table.esl_compact_zebra tr[onclick]").removeAttr("style").removeAttr("onclick");

            $("table.esl_compact_zebra").attr("width", "100%");

            var cells = $("table.esl_compact_zebra tr td").filter(function(index){
                return index % 6 === 3;
            });

            cells.toArray().forEach(function(entry){
                var elem = '<a href="' + $(entry.firstChild).attr("href").replace("match", "admin_match") + '" target="_blank">Admin</a>';
                var td = "<td class='TextS' align='center' width='4%'>" + elem + "</td>";
                $(td).insertAfter(entry);
            });

            $("table.esl_compact_zebra tr th").attr("colspan", 7);

        }

    }

    class AdminMatch{

        static checkMatch(){
            var statusOptions = $("select[name=status] option").toArray();
            statusOptions.forEach(function(entry){
                if($(entry).text().indexOf("closed") > -1)
                    $(entry).attr("selected", "");
                else
                    $(entry).removeAttr("selected");
            });

            $("select[name=status]").val("closed");

            var calcOptions = $("select[name=calculate] option").toArray();
            calcOptions.forEach(function(entry){
                if($(entry).text().indexOf("yes") > -1)
                    $(entry).attr("selected", "");
                else
                    $(entry).removeAttr("selected");
            });

            $("select[name=calculate]").val("yes");

            $("input[type=checkbox]").not("[name='featured']").attr("checked", "checked");
        }

        static openMatch(){
            var statusOptions = $("select[name=status] option").toArray();
            statusOptions.forEach(function(entry){
                if($(entry).text().indexOf("open") > -1)
                    $(entry).attr("selected", "");
                else
                    $(entry).removeAttr("selected");
            });

            $("select[name=status]").val("open");

            $("td:contains('round1team2')").siblings().not(".TextS").children().not("[type=hidden]").val("");
            $("td:contains('round1team2')").siblings().not(".TextS").children().not("[type=hidden]").val("");

            $("input[type=checkbox]").removeAttr("checked");
        }

        static deleteMatch(){
            var delOptions = $("select[name=active] option").toArray();
            delOptions.forEach(function(entry){
                if($(entry).text().indexOf("no") > -1)
                    $(entry).attr("selected", "");
                else
                    $(entry).removeAttr("selected");
            });

            $("select[name=active]").val("no");
            $("select[name=active]").parents().filter("form").submit();
        }

        static activateMatch(){
            var delOptions = $("select[name=active] option").toArray();
            delOptions.forEach(function(entry){
                if($(entry).text().indexOf("yes") > -1)
                    $(entry).attr("selected", "");
                else
                    $(entry).removeAttr("selected");
            });

            $("select[name=active]").val("yes");
            $("select[name=active]").parents().filter("form").submit();
        }

        //contestant={1,2}
        static setwin(contestant, isDefwin){
            if(isDefwin){
                var statusOptions = $("select[name=defaultwin] option").toArray();
                statusOptions.forEach(function(entry){
                    if(parseInt($(entry).val()) != contestant)
                        $(entry).attr("selected", "");
                    else
                        $(entry).removeAttr("selected");
                });

                $("select[name=defaultwin]").val(contestant);
            }

            var score1, score2;
            if(contestant === 1){
                score1 = 1;
                score2 = 0;
            }else{
                score1 = 0;
                score2 = 1;
            }
            $("td:contains('round1team1')").siblings().not(".TextS").children().not("[type=hidden]").val(score1);
            $("td:contains('round1team2')").siblings().not(".TextS").children().not("[type=hidden]").val(score2);
        }

        static generateButton(name, text, type, onClick, href = true){
            var a = $("<a>" + text + "</a>");
            a.addClass("btn");
            a.addClass("btn-" + type);
            a.addClass("helper-" + name);
            if(href)
                a.attr("href", "#checked");
            a.click(onClick);
            return a;
        }

        static generateOpenMatchButton(){
            return AdminMatch.generateButton("open", "Reopen match", "success", AdminMatch.openMatch);
        }

        //contestant={1,2}
        static generateWinButton(contestant, isDefwin){
            var name = $("input[type=hidden]").filter("[name='contestant[" + contestant + "][name]']").val();

            var text;
            if(isDefwin)
                text = "Defwin to ";
            else
                text = "Win to ";
            return AdminMatch.generateButton("defwin", text + name, "primary", function(){
                AdminMatch.setwin(contestant, isDefwin);
                AdminMatch.checkMatch();
            });
        }

        static generateCheckButton(){
            return AdminMatch.generateButton("check", "Check match", "primary", AdminMatch.checkMatch);
        }

        static generateDelButton(){
            return AdminMatch.generateButton("delete", "Delete match", "danger", AdminMatch.deleteMatch, false);
        }

        static generateActiveButton(){
            return AdminMatch.generateButton("active", "Reactivate match", "success", AdminMatch.activateMatch, false);
        }

        static setButtons(){
            var buttons = [];

            $("<a id='checked'></a>").insertBefore($($(".TitleS")[2]));

            var player1 = parseInt($("input[name='contestant[1]'").attr("value"));
            var player2 = parseInt($("input[name='contestant[2]'").attr("value"));

            if($("select[name=active]").val().indexOf("yes") !== -1){
                if($("select[name=status]").val().indexOf("closed") !== -1){
                    var openMatch = AdminMatch.generateOpenMatchButton();
                    buttons.push(openMatch);
                }else{
                    var checkMatch = AdminMatch.generateCheckButton();
                    buttons.push(checkMatch);
                    if(player1 > 0){
                        if(player2 === 0){
                            var defwin1 = AdminMatch.generateWinButton(1, true);
                            buttons.push(defwin1);
                        }else{
                            var win1 = AdminMatch.generateWinButton(1, false);
                            var win2 = AdminMatch.generateWinButton(2, false);
                            buttons.push(win1);
                            buttons.push(win2);
                        }
                    }
                    if(player2 > 0){
                        if(player1 === 0){
                            var defwin2 = AdminMatch.generateWinButton(2, true);
                            buttons.push(defwin2);
                        }
                    }
                }
                var delMatch = AdminMatch.generateDelButton();
                buttons.push(delMatch);
            }else{
                var activateMatch = AdminMatch.generateActiveButton();
                buttons.push(activateMatch);
            }

            for(var i = 0; i < buttons.length; i++){
                if(i === 0){
                    $(buttons[i]).insertBefore($("form")[0]);
                    continue;
                }
                $(buttons[i]).insertAfter($(buttons[i-1]));
            }
        }

    }

    class Brackets{

        static updateVSButtons(){
            var vsDiv = $(".inner-status");
            vsDiv.css("left", "0");
            vsDiv.css("right", "0");
            vsDiv.css("width", "80%");
            vsDiv.css("margin", "0px auto");

            var MATCH = $(".inner-status a");
            MATCH.text("MATCH");
            MATCH.wrap("<div style='width:45%;display:inline-block;'></div>");

            $(MATCH).each(function() {
                $(this).attr("href", $(this).attr("href") + "?killcache=true");
            });

            var DIVs = $(".inner-status div");

            DIVs.toArray().forEach(function(entry){
                var clone = $(entry).clone();
                clone.children().filter("a").text("ADMIN");
                var url = clone.children().filter("a").attr("href");
                clone.children().filter("a").attr("href", url.replace("match", "admin_match"));
                clone.insertAfter(entry);
                $("<span>|</span>").insertAfter(entry);
            });
        }

    }

    if(Page.isAdminMatch()){
        AdminMatch.setButtons();
    }
    if(Page.isBracket()){
        Brackets.updateVSButtons();
    }
    if(Page.isLeagueResults()){
        LeagueResults.fixTables();
    }

})();
