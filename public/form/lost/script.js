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
    const loc = itemLocation.value
    const time = dateTime.value
    const category = itemCategory.value
    const desc = itemDescription.value
    const image = itemPhoto.files[0];

    const formData = new FormData();

    formData.append('title', title)
    formData.append(`location`, loc)
    formData.append(`date`, time)
    formData.append(`category`, category)
    formData.append(`description`, desc)
    formData.append('image', image)

    console.log(formData)
    const response = await fetch('/items', {
        method: 'POST',
        headers: {'Authorization': token},
        body: formData
    })

    const data = await response.json() 
    if (response.status === 200) {
        alert(`Successfully registered the Lost Report.`)
    }
}