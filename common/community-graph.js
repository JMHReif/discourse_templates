var endpoint = "https://community-graphql-api.now.sh/";

function avatar(data) {
    return "<img alt='" + data.name + "' class='avatar' src='" + data.avatar + "'/> ";
}

function contentLink(title, url) {
    return "<a class='community content' href='" + url + "'>" + title + "</a>";
}

function userTile(obj) {    
    return '<div class="user tile">' +
        avatar(obj) + 
        (obj.screenName || obj.name) + 
        '</div>';
}

function progLanguage (lang) {
    // Need image tile
    return '<div class="proglanguage">' + lang + '</div>';
}

function dateFormat(str) {
    var d = new Date(str);
    var months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    var month = months[d.getMonth()];
    var year = d.getFullYear();
    var dt = d.getDate();

    return month + ' ' + dt + ', ' + year;
}

var queries = {
    topContent: {
        query: `{
            topCommunityBlogsAndContent { 
                title
                url
                author {
                  name
                  screenName
                  avatar
                }
            }                    
         }`,
         handler: data => {
            var content = data.data.topCommunityBlogsAndContent;

            content.map(article => {
                $("ul#communityBlogs").append(
                    '<li class="community content">' +
                    avatar(article.author) + 
                    contentLink(article.title, article.url) + 
                    '</li>'
                );
            });
         }
    },
    topDevs: {
        query: `{
            topNewCertifiedDevelopers {
                developer {
                    name
                    screenName
                    avatar
                }
            }
        }`,
        handler: data => {
            var devs = data.data.topNewCertifiedDevelopers;

            devs.map(obj => obj.developer).forEach(dev => {
                $("ul#devList").append('<li class="developer">' + 
                    avatar(dev) + 
                    dev.name + '</li>');
            });
            //$('ul#devList')
        }
    },
    topProjects: {
        query: `{
            topCommunityOpenSourceProjects{
                title
                url
                description
                releaseDate
                language
                author {
                  name
                  screenName
                  avatar
                }
            }
        }`,
        handler: data => {
            var projs = data.data.topCommunityOpenSourceProjects;

            projs.map(proj => {
                $("ul#communityOpenSource").append(
                    '<li class="communityopensource">' +
                    dateFormat(proj.releaseDate) + ' ' + 
                    contentLink(proj.title, proj.url) + 
                    progLanguage(proj.language) + 
                    userTile(proj.author) + 
                    "</li>");
            });
        }
    },
    twin4j: {
        query: `{
            thisWeekInNeo4j {
                featuredCommunityMember{
                    image
                }
                date
                url
                text
                }
            }`,
        handler: data => {
            var twin4j = data.data.thisWeekInNeo4j;
            var featuredMember = twin4j.featuredCommunityMember;

            $("div#twin4jContainer").append(
                '<h4>' + contentLink(twin4j.date, twin4j.url) + '</h4>' +
                '<p class="weekly box">' + 
                twin4j.text +
                '</p>'
            );

            // Featured comm member.
            $("div#featuredDeveloper").append(
                "<img class='featured member' src='" + featuredMember.image + "' alt='" +
                twin4j.date + "'" + 
                "/>"
            )
        }
    }
}

function genericError(err) {
    console.error('Kudos to Nav; ', err);
}

function graphQL(query, success, fail) {
    if (!fail) {
        fail = genericError;
    }
    
    return $.ajax({
        url: endpoint,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            operationName:null,
            variables: {},
            query: query
        }),
        success: success,
        error: fail
    });
}

var pageData = {};
function pageReady() {
    Object.keys(queries).map(key => {
        var pkg = queries[key];
        var query = pkg.query;
        var handler = pkg.handler;

        graphQL(pkg.query, data => {
            console.log('Query ', key, 'succeeded', data);

            if (handler) { handler(data); }
            pageData[query] = data;
        }, err => {
            console.error('Query ', key, 'failed', err);
        });
    })
}

$(document).ready(pageReady);

