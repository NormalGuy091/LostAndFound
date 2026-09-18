const apiBase = '/admin'
const display = document.querySelector("#displayArea")

display.value = ""

async function showAllData() {
    let tableName = prompt('Please input table name')
    const token = localStorage.getItem('token')
    const response = await fetch(apiBase + '/showtable', {
        method: 'POST',
        headers: {"Content-Type": "application/json", 'Authorization': token},
        body:JSON.stringify({
            table: tableName
        })
    })
    const users = await response.json()
    let userList
    for (const user of users) {
        userList += `
        Id: ${user.id}
        Email: ${user.username}
        HashedPasssword: ${user.password}
        Role: ${user.role}
        \n
        `
    }
    console.log(userList)
    display.value = userList
};

async function createUser() {
    const email = prompt('Please input email')
    const password = prompt('Please input password')
    
    const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({username: email, password: password})
    })
    const data = await response.json
}

async function deleteUser() {
    const email = prompt('Please input email')
    const token = localStorage.getItem('token')

    const response = await fetch('/admin/delete', {
        method: 'DELETE',
        headers: {"Content-Type": "application/json", "Authorization": token},
        body: JSON.stringify({email: email})
    })
    const data = await response.json
    alert(data.message)
}