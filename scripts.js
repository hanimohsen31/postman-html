"use-strict"
// ----------------------------  DIVIDER  inputs ------------------------------
let method = ""
let url = ""
let authorization = ""
let sendHeaders = ""
let requestBody = ""
let projectName = ""
let apiName = ""
let headersInput = ""
let projectsList = ""
let apisList = ""
let headers = {}
let hasErrors = false
let notificationTimeout
const localStorageTokenName = "AuthorizationToken"

// ----------------------------  DIVIDER  on start ----------------------------
document.getElementById("requestForm").addEventListener("submit", function (e) {
  e.preventDefault()
  try {
    submit()
  } catch (error) {
    notifications(error, "error")
  }
})

function setPlaceholders() {
  const headerPlacholder = JSON.stringify(
    {
      "Header-Test1": "Jujubeman",
      "email": "string",
    },
    null,
    2
  )
  const bodyPlacholder = JSON.stringify(
    {
      username: "string",
      email: "string",
    },
    null,
    2
  )
  document.getElementById("url").setAttribute("placeholder", "http://194.238.24.200:5200/api/Coupon/GeAlltByType")
  document.getElementById("authorization").setAttribute("placeholder", "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwdWJsaWNfaWQiOiIxOTVjZjk3MC0yOTQ2LTQwNTItO")
  document.getElementById("headersInput").setAttribute("placeholder", headerPlacholder)
  document.getElementById("requestBody").setAttribute("placeholder", bodyPlacholder)
}

function makeVisible() {
  let isVisibleString = localStorage.getItem("isVisible")
  let isVisible = isVisibleString ? JSON.parse(isVisibleString) : false
  localStorage.setItem("isVisible", !isVisible)
  document.getElementById("toggleSecondAccordion").click()
}

function checkVisiblity() {
  let isVisibleString = localStorage.getItem("isVisible")
  let isVisible = isVisibleString ? JSON.parse(isVisibleString) : false
  isVisible ? document.getElementById("toggleSecondAccordion").click() : null
}

function onInit() {
  document.getElementById("authorization").value = localStorage.getItem(`${localStorageTokenName}`)
}

// ----------------------------  DIVIDER  submit form -------------------------
function submit() {
  hasErrors = false
  getInputs()
  setHeaders()
  if (hasErrors) return
  const options = { method, headers }
  if (requestBody && (method === "POST" || method === "PUT")) setRequestBody()
  if (hasErrors) return
  fetch(url, options)
    .then((response) => {
      showResponseHeaders(response)
      return response.json()
    })
    .then((data) => {
      hasErrors = false
      showResponseInUI(data)
    })
    .catch((error) => (document.getElementById("responseOutput").textContent = "Error: " + error))
}

function getInputs() {
  // checkbox
  sendHeaders = document.getElementById("sendHeaders").checked
  // inputs
  url = document.getElementById("url").value
  authorization = document.getElementById("authorization")?.value
  requestBody = document.getElementById("requestBody")?.value
  projectName = document.getElementById("projectName")?.value
  apiName = document.getElementById("apiName")?.value
  headersInput = document.getElementById("headersInput")?.value
  // dropdown
  method = document.getElementById("method")?.value
  projectsList = document.getElementById("projectsList")?.value
  apisList = document.getElementById("apisList")?.value
}

function setHeaders() {
  headers = new Headers()
  if (authorization && sendHeaders) headers.append("Authorization", `Bearer ${authorization}`)
  headers.append("Content-Type", "application/json")
  headers.append("Access-Control-Allow-Origin", "*")
  if (headersInput && sendHeaders) {
    try {
      let headersParsed = JSON.parse(headersInput)
      for (const [key, value] of Object.entries(headersParsed)) {
        headers.append(key, value)
      }
      hasErrors = false
    } catch {
      notifications("Error in Parsing Headers", "error")
      hasErrors = true
    }
  }
}

function setRequestBody() {
  if (requestBody) {
    try {
      JSON.parse(requestBody)
      hasErrors = false
      return requestBody
    } catch {
      hasErrors = true
      notifications("Error in Parsing Body", "error")
      return {}
    }
  }
}

// ----------------------------  DIVIDER  Response in UI ----------------------
function showResponseInUI(data) {
  document.getElementById("responseOutput").textContent = JSON.stringify(data, null, 2)
  notifications("Response Success", "success")
}

function showResponseHeaders(response) {
  let object = {
    headers: response.headers,
    redirected: response.redirected,
    status: response.status,
    statusText: response.statusText,
    type: response.type,
    url: response.url,
  }
  document.getElementById("responseHeaders").textContent = JSON.stringify(object, null, 2)
}

// ----------------------------  DIVIDER  token in localStorage ---------------
function saveToken() {
  const authorization = document.getElementById("authorization").value
  if (authorization) localStorage.setItem(`${localStorageTokenName}`, authorization)
  else notifications("Please Enter A Token", "error")
}

function clearLocalStorage() {
  document.getElementById("authorization").value = ""
  localStorage.clear()
}

// ----------------------------  DIVIDER  notifications -----------------------
function notifications(message, status) {
  // status => error | success
  const errorClasses = ["d-flex", "alert", "alert-danger"]
  const successClasses = ["d-flex", "alert", "alert-success"]

  const notification = document.getElementById("notification")
  notification.classList.value = "d-none"

  let span = document.createElement("span")
  span.textContent = message
  notification.appendChild(span)

  // notification.textContent = message
  // notification.innerHTML = span

  notification.classList.remove("d-none")

  status == "error" ? notification.classList.add(...errorClasses) : notification.classList.add(...successClasses)

  // Clear existing timeout if it exists
  if (notificationTimeout) {
    clearTimeout(notificationTimeout)
  }

  notificationTimeout = setTimeout(() => {
    notification.innerText = ""

    status == "error" ? notification.classList.remove(...errorClasses) : notification.classList.remove(...successClasses)

    notification.classList.add("d-none")
  }, 5000)
}

// ----------------------------  DIVIDER  get apis -------------------------
// Projects
function getProjectsSelectOptions() {
  let projectsListInput = document.getElementById("projectsList")
  let apis = getAPIsListFromLocalStorage()
  let projectsStringList = getUniqueProjectNames(apis)
  projectsListInput.innerHTML = ""
  projectsListInput.append(createSelectInputOption("All", "All"))
  // making options
  if (projectsStringList?.length) {
    projectsStringList.forEach((project) => {
      projectsListInput.append(createSelectInputOption(project, project))
    })
  }
}

function getAPIsListFromLocalStorage() {
  let apis = []
  let apisString = localStorage.getItem("apis")
  if (apis) apis = JSON.parse(apisString)
  else apis = []
  let result = apis && apis?.length ? apis : []
  return result
}

function getUniqueProjectNames(apis) {
  if (apis && apis?.length) {
    let projectNames = apis.map((obj) => obj.projectName)
    let uniqueProjectNames = [...new Set(projectNames)]
    return uniqueProjectNames
  } else {
    return []
  }
}

function createSelectInputOption(value, text) {
  let option = document.createElement("option")
  option.value = value
  option.innerText = text
  return option
}

// APIs
function getAPIsSelectOptions() {
  let apisListInput = document.getElementById("apisList")
  let apis = getAPIsListFromLocalStorage()
  let projectAPIs = getAPIsUponProject(apis)
  apisListInput.innerHTML = ""
  apisListInput.append(createSelectInputOption("All", "All"))
  // making options
  if (projectAPIs?.length) {
    projectAPIs.forEach((project) => {
      apisListInput.append(createSelectInputOption(project.apiName, project.apiName))
    })
  }
}

function getAPIsUponProject(array) {
  let currentProject = document.getElementById("projectsList").value
  if (currentProject === "All") return array
  else return array.filter((obj) => obj.projectName === currentProject)
}

// setting on select
function resetInputsUponAPI() {
  let currentAPI = document.getElementById("apisList").value
  let apisArray = getAPIsListFromLocalStorage()
  let filteredAPI = apisArray.find((obj) => obj.apiName === currentAPI)
  // setting inputs
  document.getElementById("sendHeaders").checked = filteredAPI?.sendHeaders
  document.getElementById("url").value = filteredAPI?.url
  document.getElementById("authorization").value = filteredAPI?.authorization
  document.getElementById("requestBody").value = filteredAPI?.requestBody
  document.getElementById("projectName").value = filteredAPI?.projectName
  document.getElementById("apiName").value = filteredAPI?.apiName
  document.getElementById("headersInput").value = filteredAPI?.headersInput
  document.getElementById("method").value = filteredAPI?.method
}

// ----------------------------  DIVIDER  save apis -------------------------
function saveAPI() {
  hasErrors = false
  getInputs()
  setHeaders()
  let apiData = {
    // checkbox
    sendHeaders,
    // inputs
    url,
    authorization,
    requestBody,
    projectName,
    apiName,
    headersInput,
    // dropdown
    method,
  }

  if (!url || !projectName || !apiName || !method) {
    hasErrors = true
    notifications("Data Not Complete", "error")
    return
  }

  if (sendHeaders && !headersInput) {
    hasErrors = true
    notifications("Headers Not Complete", "error")
    return
  }

  if (hasErrors) return

  let apis = getAPIsListFromLocalStorage()
  let isExistedIndex = apis?.length ? apis.findIndex((elm) => elm.apiName == apiName) : -1
  // The findIndex() method returns -1 if no match is found.
  if (isExistedIndex !== -1) {
    try {
      apis[isExistedIndex] = apiData
      localStorage.setItem("apis", JSON.stringify(apis))
      getProjectsSelectOptions()
      getAPIsSelectOptions()
      notifications("API Updated Successfully", "success")
    } catch {
      notifications("Error in Parsing Json to Save API", "error")
    }
  } else {
    try {
      apis.push(apiData)
      localStorage.setItem("apis", JSON.stringify(apis))
      getProjectsSelectOptions()
      getAPIsSelectOptions()
      notifications("API Saved Successfully", "success")
    } catch {
      notifications("Error in Parsing Json to Save API", "error")
    }
  }
}

// ----------------------------  DIVIDER  calls -------------------------
onInit()
setPlaceholders()
checkVisiblity()
getProjectsSelectOptions()
getAPIsSelectOptions()
