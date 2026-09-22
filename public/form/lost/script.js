// HTML ELEMENTS //

const token = localStorage.getItem('token')

const itemName = document.getElementById('item-name')
const itemLocation = document.getElementById('location')
const dateTime = document.getElementById('time')
const itemCategory = document.getElementById('item-category')
const itemDescription = document.getElementById('description')
const itemPhoto = document.getElementById('photo')


async function submitForm() {
    const title = itemName.value
    const image = itemPhoto.files[0];

    const formData = new FormData();

    formData.append('title', title)
    formData.append('image', image)

    const response = await fetch('/items', {
        method: 'POST',
        headers: {'Authorization': token},
        body: formData
    })

    const data = await response.json()
}