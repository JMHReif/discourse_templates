var endpoint = "https://community-graphql-api.now.sh/";

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
                console.log("Append");
                $("ul#devList").append('<li class="developer">' + 
                    "<img class='avatar' src='" + dev.avatar + "'/>" + 
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
                author {
                  name
                  screenName
                  avatar
                }
            }
        }`,
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
            }`
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
