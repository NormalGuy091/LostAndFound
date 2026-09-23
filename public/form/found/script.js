const itemName = document.getElementById('item-name')
const itemLocation = document.getElementById('location')
const dateTime = document.getElementById('time')
const itemCategory = document.getElementById('item-category')
const itemDescription = document.getElementById('description')
const itemPhoto = document.getElementById('photo')

async function logout() {
    await fetch('/auth/logout', { method: 'POST' })
    window.location.href = '/login'
}

async function submitForm() {
    const title = itemName.value
    const loc = itemLocation.value
    const time = dateTime.value
    const category = itemCategory.value
    const desc = itemDescription.value
    const image = itemPhoto.files[0];

    const formData = new FormData();

    formData.append(`type`, 'found')
    formData.append('title', title)
    formData.append(`location`, loc)
    formData.append(`date`, time)
    formData.append(`category`, category)
    formData.append(`description`, desc)
    if (image) formData.append('image', image)

    try {
        const response = await fetch('/items', { method: 'POST', body: formData })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Unable to register the report.')
        alert('Successfully registered the Found Report.')
        window.location.href = '/'
    } catch (error) {
        alert(error.message)
    }
}