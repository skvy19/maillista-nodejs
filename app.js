const fs = require('fs');
const url = require('url');

const renderHTML = (path, res) => {
    fs.readFile(path, null, (err, html) => {
        if(err) {
            res.writeHead(404);
            res.write('404: File not found');
        } else {
            res.write(html);
        }
        res.end();
    });
};

module.exports = {
    handleRequest: (req, res) => {

        const path = url.parse(req.url).pathname;

        if(path === '/') {

            return renderHTML('./index.html', res);

        } else if (path === '/admin') {

            return renderHTML('./admin.html', res);

        } else if (path === '/newuser' && req.method === 'POST') {
            
            const body = [];
            req.on('data', (chunk => body.push(chunk)));
            
            req.on('end', () => {
                
                fs.readFile('users.json', (err, data) => {
                    if(err) throw err;
    
                    const users = JSON.parse(data);
                    const parsedBody = Buffer.concat(body).toString();
                    const newUser = {
                        "userEmail": parsedBody.split('=')[1].replace('%40', '@')
                    };
                    
                    if(newUser.userEmail.length > 0) {
                        users.push(newUser);
                        console.log('new user added:', newUser);
                    }
    
                    const saveUsers = JSON.stringify(users, null, 2);
                    fs.writeFile('users.json', saveUsers, (err => err))
                })
                
            })
            
            res.statusCode = 302;
            res.setHeader('Location', '/');
            return res.end();

        } else {
            res.writeHead(404);
            res.write('404: File not found');
            res.end();
        }
    }
};