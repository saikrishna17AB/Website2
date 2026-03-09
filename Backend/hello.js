let mysql=require('mysql2/promise');

async function runquery(con,sql,params=[]){
    const [rows]=await con.execute(sql,params);
    return rows;
}

async function main(){
    try{
        const con=await mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'colonelroymustang'
        });
        console.log('Connected!');

        const data=await runquery(con,'show databases');
        console.log(data);
        await con.end();
        console.log('Connection ended');
    }
    catch(err){
        console.log('Error');
    }
}
main();