var endpoint = "https://community-graphql-api.now.sh/";

function avatar(data) {
    return (
        "<a href='/users/" + data.name + "' alt='" + (data.name || data.screenName) + "'>" +
        "<img alt='" + data.name + "' class='avatar' src='" + data.avatar + "'/> " + 
        "</a>"
    );
}

function contentLink(title, url) {
    return "<a class='community content' href='" + url + "'>" + title + "</a>";
}

function userTile(data) {    
    return ('<div class="user tile">' +
        avatar(data) + 
        "<a href='/users/" + data.name + "'>" + 
        (data.name || data.screenName) + 
        "</a>" +
        '</div>');
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
                $("table#devList").append('<tr class="developer">' + 
                    '<td class="dev">'+avatar(dev) + '</td><td>' +
                    contentLink(dev.screenName || dev.name, 
                        '/users/' + dev.name) + '</td></tr>');
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

            // Take first 5 only
            projs.slice(0,5).map(proj => {
                $("ul#communityOpenSource").append(
                    '<li class="communityopensource">' +
                    /* dateFormat(proj.releaseDate) + ' ' + */
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
                contentLink("<img style='height: 100%; width: 100%; object-fit: contain' class='featured member' src='" + featuredMember.image + "' alt='" +
                twin4j.date + "'" + 
                "/>", twin4j.url)
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

