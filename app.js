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
        const adminUser = 'admin';
        const adminPsw = 'test';
        const path = url.parse(req.url).pathname;

        if(path === '/') {

            return renderHTML('./index.html', res);

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

        } else if (path === '/admin') {

            return renderHTML('./admin.html', res);

        } else if (path === '/admin/users' && req.method === 'POST') {

            const body = [];
            req.on('data', (chunk => body.push(chunk)));
            
            req.on('end', () => {
                
                const parsedBody = Buffer.concat(body).toString();
                const username = parsedBody.split('&')[0].replace('admin-username=','')
                const password = parsedBody.split('&')[1].replace('admin-password=','')
                if(username == adminUser && password == adminPsw) {
                    fs.readFile('users.json', (err, data) => {
                        if(err) throw err;
        
                        const users = JSON.parse(data);
                        res.write(`
                        <body>
                            <h5>Registrerade emailadresser:</h5>
                            <p>${JSON.stringify(users, null, 2)}</p>
                            <form action="/admin" method="POST">
                                <button type="submit">Logga ut</button>
                            </form>
                        </body>
                        `)
                        
                        
                        return res.end();
                    })
                } else {
                    res.statusCode = 302;
                    res.setHeader('Location', '/admin');
                    return res.end();
                }
                
            })
            
            
            

        } else {
            res.writeHead(404);
            res.write('404: File not found');
            res.end();
        }
    }
};