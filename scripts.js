document.getElementById('requestForm').addEventListener('submit', function (e) {
  e.preventDefault()
  submit()
})

function submit() {
  const method = document.getElementById('method').value
  const url = document.getElementById('url').value
  const authorization = document.getElementById('authorization').value
  const body = document.getElementById('body').value

  const headers = new Headers()
  if (authorization) headers.append('Authorization', `Bearer ${authorization}`)
  headers.append('Content-Type', 'application/json')

  const options = {
    method: method,
    headers: headers,
  }

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = body
    headers.append('Content-Type', 'application/json')
  }

  fetch(url, options)
    .then((response) => {console.log(response);response.json()})
    .then((data) => {console.log(data);showResponseInUI(data)})
    .catch((error) => document.getElementById('responseOutput').textContent = 'Error: ' + error)
}

function showResponseInUI(data) {
  document.getElementById('responseOutput').textContent = JSON.stringify(data, null, 2)
}
