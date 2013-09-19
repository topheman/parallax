module.exports = function(grunt) {

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Configure Grunt 
    grunt.initConfig({
        
        // grunt-contrib-connect will serve the files of the project
        // on specified port and hostname
        connect: {
            all: {
                options: {
                    port: 9000,
                    hostname: "0.0.0.0",
                    keepalive: true,
                    base: ""
                }
            }
        },
        
        // grunt-open will open your browser at the project's URL
        open: {
            debug: {
                path: 'http://localhost:<%= connect.all.options.port%>/examples/simple.headtrackr.html'
            },
            release: {
                path: 'http://localhost:<%= connect.all.options.port%>/'
            }
        }

    });

    grunt.registerTask('server', ['open:debug', 'connect:all']);
    grunt.registerTask('server-debug', ['open:debug', 'connect:all']);
    grunt.registerTask('server-release', ['open:release', 'connect:all']);
    
};