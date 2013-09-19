module.exports = function(grunt) {

    // Load Grunt tasks declared in the package.json file
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Configure Grunt 
    grunt.initConfig({
        
        // grunt-contrib-connect will serve the files of the project
        // on specified port and hostname
        connect: {
            debug: {
                options: {
                    port: 9000,
                    hostname: "0.0.0.0",
                    keepalive: true,
                    base: ""
                }
            },
            release: {
                options: {
                    port: 9000,
                    hostname: "0.0.0.0",
                    keepalive: false,//must be at false for livereload
                    base: ""
                }
            }
        },
        
        // grunt-open will open your browser at the project's URL
        open: {
            debug: {
                path: 'http://localhost:<%= connect.debug.options.port%>/examples/simple.headtrackr.html'
            },
            release: {
                path: 'http://localhost:<%= connect.release.options.port%>/'
            }
        },
        
        sass: {
            dist: {
                files: {
                    'assets/styles/css/styles.css': 'assets/styles/sass/styles.sass'
                }
            }
        },
        
        watch : {
            options:{
                livereload : true
            },
            //when the index.html file is changed, only trigger a reload
            "dev-html": {
                files : ['index.html']
            },
            //when a sass file is changed, rebuild the css
            "dev-sass" : {
                files : ['assets/styles/sass/**/*.sass'],
                tasks : ['sass']
            }
        }

    });

    grunt.registerTask('server', ['open:debug', 'connect:debug']);
    grunt.registerTask('server-debug', ['open:debug', 'connect:debug']);
    grunt.registerTask('server-release', ['open:release', 'connect:release', 'watch']); //only watch on release
    
};