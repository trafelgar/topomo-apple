const todos = document.querySelectorAll(".card");
const all_status = document.querySelectorAll(".status");
let draggableTodo = null;

todos.forEach(todo =>{
    todo.addEventListener("dragstart" , dragStart);
    todo.addEventListener("dragend" , dragEnd);

})

function dragStart(){
    draggableTodo = this;
    console.log("dragstart");
}
function dragEnd(){
    draggableTodo = null;
    console.log("dragend");
}

all_status.forEach((status)=>{
    status.addEventListener("dragover" , dragOver);
    status.addEventListener("dragenter" , dragEnter);
    status.addEventListener("dragleave" , dragLeave);
    status.addEventListener("drop" , dragDrop);
})
function dragOver(e){
    e.preventDefault();
    console.log("dragover");
}
function dragEnter(){
    this.style.border = " 2px solid #8288BA ";
    console.log("dargenter");
}
function dragLeave(){
    this.style.border ="none";
    console.log("dragleave");
}
function dragDrop(e) {
    this.style.border = "none";
    e.preventDefault();
    const target = e.target.closest('.card'); // Get the closest card element
    const targetStatus = e.target.closest('.status'); // Get the closest status element

    if (draggableTodo) {
        // Attempt to retrieve the title of the draggable card
        const cardTitle = draggableTodo.querySelector('.card-title').textContent.trim(); // Get the title of the draggable card

        const cards = JSON.parse(localStorage.getItem('cards')) || []; // Retrieve all cards from localStorage

        // Check for card data
        const cardData = cards.find(card => card.title === cardTitle); // Find the card data by title
        if (!cardData) {
            console.error("Card data not found for title:", cardTitle);
            return; // Exit the function if cardData is not found
        }

        if (target && cardData.status === targetStatus.dataset.status) {
            // If dropping on another card, determine if it's in the same column
            const bounding = target.getBoundingClientRect();
            const offset = bounding.y + bounding.height / 2; // Middle of the target card

            if (e.clientY < offset) {
                // Drop before the target card
                target.parentNode.insertBefore(draggableTodo, target);
            } else {
                // Drop after the target card
                target.parentNode.insertBefore(draggableTodo, target.nextSibling);
            }
        } else if (targetStatus) {
            // If dropping on a status (column), append the card to that status
            if (cardData.type === 'atomic' && targetStatus.dataset.status ==='done'){
                console.log("Before increment, done_number:", cardData.done_number);
                cardData.done_number++;
                console.log("this is atomic");
                console.log( cardData.done_number );
            }
            targetStatus.appendChild(draggableTodo);
            
            // Remove the card from localStorage
            removeCardFromStorage(cardTitle); // Remove the card from localStorage
            
            // Update the card's status and save it again
            console.log("the old status", cardData.status);
            cardData.status = targetStatus.dataset.status; // Update to the new status
            console.log("the new status", cardData.status); // Log the new status
            // Save the updated card back to localStorage
            saveCardToStorage(cardData); // Save the updated card back to localStorage
        }
    }
    console.log("dragdrop");
}

/* modal */
const btns = document.querySelectorAll("[data-target-modal]");
const close_modals = document.querySelectorAll(".close-model");
const overlay = document.getElementById("overlay");

// Create a reusable function for closing modals
function closeModal() {
  const modals = document.querySelectorAll(".task-model");
  modals.forEach((modal) => modal.classList.remove("active"));
  overlay.classList.remove("active");
  stopAlarmSound();
}

btns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(btn.dataset.targetModal).classList.add("active");
    overlay.classList.add("active");
  });
});

// Update the existing close_modals event listener to use the new function
close_modals.forEach((btn) => {
  btn.addEventListener("click", closeModal);
});

// Update window.onclick to use the new function
window.onclick = (event) => {
  if (event.target == overlay) {
    closeModal();
  }
};


// creat card for task---------------------------------------------
const todo_submit = document.getElementById("todo_submit");
const paragraph_submit = document.getElementById("paragraph_submit");

todo_submit.addEventListener("click", () => createCard('task'));
paragraph_submit.addEventListener("click", () => createCard('paragraph'));

// Function to save card to localStorage
function saveCardToStorage(card) {
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    cards.push(card); // Save the entire card object
    localStorage.setItem('cards', JSON.stringify(cards));
}

// Function to remove card from localStorage
function removeCardFromStorage(title) {
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    const updatedCards = cards.filter(card => card.title !== title);
    localStorage.setItem('cards', JSON.stringify(updatedCards));
}
const allCards = [];
// Function to load cards from localStorage
function loadCards() {
    const cards = JSON.parse(localStorage.getItem('cards')) || [];
    
    cards.forEach(cardData => {
        const card_div = createCardElement(cardData);
        
        // Determine the status container based on the card's status
        const targetStatus = document.querySelector(`.status[data-status="${cardData.status}"]`);
        if (targetStatus) {
            targetStatus.appendChild(card_div); // Append the card to the correct status container
        } else {
            document.querySelector(".todo-container").appendChild(card_div); // Fallback to default container
        }
    });
}

// Function to create card element
function createCardElement(cardData) {
    const card_div = document.createElement("div");
    card_div.classList.add("card", "mb-3");
    card_div.setAttribute("draggable", "true");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const headerDiv = document.createElement("div");
    headerDiv.classList.add("header-style");

    const title = document.createElement("h5");
    title.classList.add("card-title");
    title.textContent = cardData.title;

    const clo = document.createElement("span");
    clo.classList.add("close");
    clo.innerHTML = "&times;";
    clo.addEventListener("click", function() {
        card_div.remove(); // Remove the card from the UI
        removeCardFromStorage(cardData.title); // Remove the card from localStorage
    });

    headerDiv.appendChild(title);
    headerDiv.appendChild(clo);
    cardBody.appendChild(headerDiv);

    // Add content based on card type
    if (cardData.type === 'atomic') {
        cardBody.innerHTML = `
            <div class="header-style text-center mb-4" style="display: flex; justify-content: center; align-items: center; position: relative;">
                <h5 class="card-title" style="
                    font-size: 32px;
                    font-weight: bold;
                    color: #2C3E50;
                    margin: 0;
                    text-align: center;
                    width: 100%;
                ">${cardData.title}</h5>
            </div>
            <div class="card-content">
                <div class="atomic-section">
                    <div class="text-center" style="
                        color: #6A9C94;
                        font-size: 16px;
                        margin-bottom: 8px;
                    ">So I can Become</div>
                    <div class="text-center" style="
                        font-size: 22px;
                        color: #CDA08B;
                        font-weight: 500;
                    ">${cardData.outcome}</div>
                </div>
            </div>
            <div style="display: flex; justify-content: center; align-items: center; position: relative; text-align: center;">
                <span class="close" style="
                    font-size: 24px;
                    color: #6A9C94;
                    cursor: pointer;
                ">&times;</span>
            </div>
        `;
        
        // Add event listener to the close button
        const closeButton = cardBody.querySelector('.close');
        closeButton.addEventListener('click', function() {
            const cardTitle = cardData.title; // Get the title to remove from localStorage
            card_div.remove(); // Remove the card from the UI
            removeCardFromStorage(cardTitle); // Remove the card from localStorage
        });
        card_div.addEventListener('click', () => {
            // Display the form when the card is clicked
            displayForm(cardData);
        });
        allCards.push(cardData);
    }
    else if (cardData.type === 'checklist') {
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("card-content");
        
        cardData.items.forEach(item => {
            const checklistItem = document.createElement("div");
            checklistItem.style.display = 'flex';
            checklistItem.style.alignItems = 'center';
            checklistItem.style.gap = '8px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = item.checked; // Set the checkbox state based on saved data

            const span = document.createElement('span');
            span.textContent = item.text;

            // Apply initial styles based on checkbox state
            if (item.checked) {
                span.style.textDecoration = 'line-through';
                span.style.opacity = '0.5';
            }

            // Add event listener to update styles and save state
            checkbox.addEventListener('change', function() {
                // Remove the current card from local storage
                removeCardFromStorage(cardData.title); // Remove the card from localStorage

                // Update the checked state
                item.checked = this.checked; // Update checked state

                // Update styles based on checkbox state
                if (this.checked) {
                    span.style.textDecoration = 'line-through';
                    span.style.opacity = '0.5';
                } else {
                    span.style.textDecoration = 'none';
                    span.style.opacity = '1';
                }

                // Save the updated card back to local storage
                const updatedCardData = {
                    ...cardData,
                    items: cardData.items // Ensure the updated items are saved
                };
                saveCardToStorage(updatedCardData); // Save updated cardData to localStorage
            });

            checklistItem.appendChild(checkbox);
            checklistItem.appendChild(span);
            contentDiv.appendChild(checklistItem);
        });

        cardBody.appendChild(contentDiv);
    } else if (cardData.type === 'list') {
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("card-content");
        const listElement = document.createElement(cardData.listType === 'ordered' ? 'ol' : 'ul');
        listElement.style.paddingLeft = '20px';

        cardData.items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            listElement.appendChild(li);
        });

        contentDiv.appendChild(listElement);
        cardBody.appendChild(contentDiv);
    }
    
    else if (cardData.type === 'deadline') {
        const currentDate = new Date();
        const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Convert the deadline string back to a Date object
        const deadlineDate = new Date(cardData.deadline); // Ensure this is a Date object
        const formattedDeadlineDate = deadlineDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const card = document.createElement("div");
        
        // Check if the deadline has passed
        if (deadlineDate.getDate() < currentDate.getDate()) {
            card.className = "card card-red mb-3"; // Add both card and card-red classes
            card.draggable = true;
            card.innerHTML = `
            <div class="card-body">
                <div class="header-style">
                    <h5 class="card-title" style="font-family:'Permanent Marker', cursive;font-weight: 400;font-style: normal;
                                                    background: #775554;
                                                    -webkit-background-clip: text;
                                                    -webkit-text-fill-color: transparent;">
                    ${cardData.title}</h5>
                    <span class="close">&times;</span>
                </div>
                <div class="card-content">
                    <p class="card-text">
                        <strong>Current:</strong> ${formattedCurrentDate}<br>
                        <strong>Deadline:</strong> ${formattedDeadlineDate}
                    </p>
                </div>
            </div>
        `;
        } else if (deadlineDate.getDate() > currentDate.getDate())  {
            card.className = "card mb-3"; // Only add the card class
            card.draggable = true;
            card.style.backgroundColor = "#775554"; // Set background color for on-time card
            card.innerHTML = `
            <div class="card-body">
                <div class="header-style">
                    <h5 class="card-title">${cardData.title}</h5>
                    <span class="close">&times;</span>
                </div>
                <div class="card-content">
                    <p class="card-text">
                        <strong>Current:</strong> ${formattedCurrentDate}<br>
                        <strong>Deadline:</strong> ${formattedDeadlineDate}
                    </p>
                </div>
            </div>
        `;
        }else {
            card.className = "card card-darkblue mb-3"; // Add both card and card-red classes
            card.draggable = true;
            card.innerHTML = `
            <div class="card-body">
                <div class="header-style">
                    <h5 class="card-title" style="font-family:'Permanent Marker', cursive;font-weight: 400;font-style: normal;
                                                    background: #0D1321;
                                                    -webkit-background-clip: text;
                                                    -webkit-text-fill-color: transparent;">
                    ${cardData.title}</h5>
                    <span class="close">&times;</span>
                </div>
                <div class="card-content">
                    <p class="card-text">
                        <strong>Current:</strong> ${formattedCurrentDate}<br>
                        <strong>Deadline:</strong> ${formattedDeadlineDate}
                    </p>
                </div>
            </div>
        `;
        }

        card.addEventListener("dragstart", dragStart);
        card.addEventListener("dragend", dragEnd);
        
        const closeButton = card.querySelector('.close');
        closeButton.addEventListener('click', function() {
            const cardTitle = cardData.title; // Get the title to remove from localStorage
            card.remove(); // Remove the card from the UI
            removeCardFromStorage(cardTitle); // Remove the card from localStorage
        });
        return card;
    } 
    // --------------------------------------------------
    else if (cardData.type === 'task' || cardData.type === 'paragraph') {
        const contentDiv = document.createElement("div");
        contentDiv.classList.add("card-content");
        contentDiv.innerHTML = `<p class="card-text">${cardData.paragraph || ''}</p>`;
        cardBody.appendChild(contentDiv);
    }

    card_div.appendChild(cardBody);
    card_div.addEventListener("dragstart", dragStart);
    card_div.addEventListener("dragend", dragEnd);

    return card_div;
}

// Modify createCard function to save card data
function createCard(formType) {
    const titleInput = document.getElementById(formType === 'task' ? 'todo_input' : 'todo_input_paragraph').value.trim();
    const paragraphInput = document.getElementById('paragraph_input')?.value.trim();

    if (!titleInput) {
        closeModal();
        return;
    }

    const cardData = {
        type: formType,
        title: titleInput,
        paragraph: paragraphInput || '',
        status: 'todo'
    };

    const card_div = createCardElement(cardData);
    document.querySelector(".todo-container").appendChild(card_div);
    saveCardToStorage(cardData);

    clearInputs(formType);
    overlay.classList.remove("active");
}

// Clear inputs function
function clearInputs(formType) {
    if (formType === 'task') {
        document.getElementById("todo_input").value = "";
        task_form.classList.remove("active");
    } else {
        document.getElementById("todo_input_paragraph").value = "";
        document.getElementById("paragraph_input").value = "";
        paragraph_form.classList.remove("active");
    }
}

// Add this function to handle the checklist items
function addChecklistItem() {
    const checklistInput = document.getElementById('checklist_input');
    
    if (checklistInput.value.trim() !== '') {
        // Create new checklist item
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checklist-item';
        itemDiv.style.display = 'flex';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.gap = '8px';
        
        // Create checkbox and span elements
        const innerDiv = document.createElement('div');
        innerDiv.style.display = 'flex';
        innerDiv.style.alignItems = 'center';
        innerDiv.style.gap = '8px';
        innerDiv.style.flex = '1';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        
        const span = document.createElement('span');
        span.textContent = checklistInput.value;
        
        // Add checkbox change event listener
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                span.style.textDecoration = 'line-through';
                span.style.opacity = '0.5';
            } else {
                span.style.textDecoration = 'none';
                span.style.opacity = '1';
            }
        });
        
        // Create remove button
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-item';
        removeButton.style.border = 'none';
        removeButton.style.background = 'none';
        removeButton.style.color = '#6A9C94';
        removeButton.style.marginLeft = 'auto';
        removeButton.textContent = '×';
        removeButton.addEventListener('click', function() {
            itemDiv.remove();
        });
        
        innerDiv.appendChild(checkbox);
        innerDiv.appendChild(span);
        innerDiv.appendChild(removeButton);
        
        itemDiv.appendChild(innerDiv);
        
        // Insert the new item after the checklist input section
        const checklistInputContainer = document.getElementById('checklist_input').parentElement;
        checklistInputContainer.parentNode.insertBefore(itemDiv, checklistInputContainer.nextSibling);
        
        // Clear the input
        checklistInput.value = '';
    }
}


// Add event listener to the add button
document.getElementById('checklist_add').addEventListener('click', addChecklistItem);

// Optional: Allow adding items with Enter key
document.getElementById('checklist_input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addChecklistItem();
    }
});
function createChecklistCard() {
    const titleInput = document.getElementById('todo_input_checklist').value.trim();
    const checklistItems = Array.from(document.querySelectorAll('.checklist-item')).map(item => ({
        text: item.querySelector('span').textContent,
        checked: item.querySelector('input[type="checkbox"]').checked // Capture checked state
    }));

    // Create main card container
    const card_div = document.createElement("div");
    card_div.classList.add("card", "mb-3");
    card_div.setAttribute("draggable", "true");

    // Create card body
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    // Create header section
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("header-style");

    const title = document.createElement("h5");
    title.classList.add("card-title");
    title.textContent = titleInput;

    const clo = document.createElement("span");
    clo.classList.add("close");
    clo.innerHTML = "&times;";

    // Add event listener to the close button to remove the card
    clo.addEventListener("click", function() {
        card_div.remove(); // Remove the card when the close button is clicked
    });

    // Assemble the basic structure
    headerDiv.appendChild(title);
    headerDiv.appendChild(clo);
    cardBody.appendChild(headerDiv);

    // Add checklist items
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("card-content");

    checklistItems.forEach(item => {
        const checklistItem = document.createElement("div");
        checklistItem.style.display = 'flex';
        checklistItem.style.alignItems = 'center';
        checklistItem.style.gap = '8px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.checked; // Set the checkbox state

        const span = document.createElement('span');
        span.textContent = item.text;

        // Apply initial styles based on checkbox state
        if (item.checked) {
            span.style.textDecoration = 'line-through';
            span.style.opacity = '0.5';
        }

        // Add event listener to update styles and save state
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                span.style.textDecoration = 'line-through';
                span.style.opacity = '0.5';
            } else {
                span.style.textDecoration = 'none';
                span.style.opacity = '1';
            }
            // Update the checklist item state in cardData
            const checklistIndex = cardData.items.findIndex(i => i.text === item.text);
            if (checklistIndex !== -1) {
                cardData.items[checklistIndex].checked = this.checked; // Update checked state
                saveCardToStorage(cardData); // Save updated cardData to localStorage
            }
        });

        checklistItem.appendChild(checkbox);
        checklistItem.appendChild(span);
        contentDiv.appendChild(checklistItem);
    });

    cardBody.appendChild(contentDiv);
    card_div.appendChild(cardBody);

    // Add to container
    const todoContainer = document.querySelector(".todo-container");
    todoContainer.appendChild(card_div);

    // Save card to localStorage
    const cardData = {
        type: 'checklist',
        title: titleInput,
        items: checklistItems,
        status: 'todo'
    };
    saveCardToStorage(cardData);

    // Add drag events
    card_div.addEventListener("dragstart", dragStart);
    card_div.addEventListener("dragend", dragEnd);

    // Clear form and close modal
    const checklistItems_toRemove = document.querySelectorAll('.checklist-item');
    checklistItems_toRemove.forEach(item => item.remove());
    document.getElementById("todo_input_checklist").value = "";
    document.getElementById("checklist_input").value = "";
    checklist_form.classList.remove("active");
    overlay.classList.remove("active");
}

// Add event listener for the checklist submit button
document.getElementById('checklist_submit').addEventListener('click', createChecklistCard);
// --------------------------------------------------------------------------------

function addListItem() {
    const listInput = document.getElementById('list_input');
    
    if (listInput.value.trim() !== '') {
        // Create new list item container
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item';
        itemDiv.style.display = 'flex';
        itemDiv.style.alignItems = 'center';
        itemDiv.style.gap = '8px';
        
        // Create inner container
        const innerDiv = document.createElement('div');
        innerDiv.style.display = 'flex';
        innerDiv.style.alignItems = 'center';
        innerDiv.style.gap = '8px';
        innerDiv.style.flex = '1';
        
        // Create span for text
        const span = document.createElement('span');
        span.textContent = listInput.value;
        
        // Create remove button
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-item';
        removeButton.style.border = 'none';
        removeButton.style.background = 'none';
        removeButton.style.color = '#6A9C94';
        removeButton.style.marginLeft = 'auto';
        removeButton.textContent = '×';
        removeButton.addEventListener('click', function() {
            itemDiv.remove();
        });
        
        innerDiv.appendChild(span);
        innerDiv.appendChild(removeButton);
        itemDiv.appendChild(innerDiv);
        
        // Insert the new item after the list input section
        const listInputContainer = listInput.parentElement;
        listInputContainer.parentNode.insertBefore(itemDiv, listInputContainer.nextSibling);
        
        // Clear the input
        listInput.value = '';
    }
}

function createListCard() {
    const titleInput = document.getElementById('todo_input_list').value.trim();
    const listType = document.querySelector('input[name="list_type"]:checked').value;
    
    // Check if title is empty
    if (!titleInput) {
        closeModal();
        return;
    }
    
    // Get all list items
    const listItems = Array.from(document.querySelectorAll('.list-item span')).map(item => item.textContent);
    
    // Create main card container
    const card_div = document.createElement("div");
    card_div.classList.add("card", "mb-3");
    card_div.setAttribute("draggable", "true");

    // Create card body
    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    // Create header section
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("header-style");
    
    const title = document.createElement("h5");
    title.classList.add("card-title");
    title.textContent = titleInput;

    const clo = document.createElement("span");
    clo.classList.add("close");
    clo.innerHTML = "&times;";

    // Add event listener to the close button to remove the card
    clo.addEventListener("click", function() {
        card_div.remove(); // Remove the card when the close button is clicked
    });

    // Assemble the basic structure
    headerDiv.appendChild(title);
    headerDiv.appendChild(clo);
    cardBody.appendChild(headerDiv);

    // Add list items
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("card-content");
    
    // Create the list element (ol or ul)
    const listElement = document.createElement(listType === 'ordered' ? 'ol' : 'ul');
    listElement.style.paddingLeft = '20px';
    
    listItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        listElement.appendChild(li);
    });

    contentDiv.appendChild(listElement);
    cardBody.appendChild(contentDiv);
    card_div.appendChild(cardBody);

    // Add to container
    const todoContainer = document.querySelector(".todo-container");
    todoContainer.appendChild(card_div);

    // Add drag events
    card_div.addEventListener("dragstart", dragStart);
    card_div.addEventListener("dragend", dragEnd);

    // Save card to localStorage
    const cardData = {
        type: 'list',
        title: titleInput,
        items: listItems,
        status: 'todo'
    };
    saveCardToStorage(cardData);

    // Clear form and close modal
    const listItems_toRemove = document.querySelectorAll('.list-item');
    listItems_toRemove.forEach(item => item.remove());
    document.getElementById("todo_input_list").value = "";
    document.getElementById("list_input").value = "";
    list_form.classList.remove("active");
    overlay.classList.remove("active");
}

// Add event listeners
document.getElementById('list_add').addEventListener('click', addListItem);
document.getElementById('list_submit').addEventListener('click', createListCard);

// Optional: Allow adding items with Enter key
document.getElementById('list_input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addListItem();
    }
});
// --------------------------------------------------------------------------------------------------

function createDeadlineCard() {
    // Get input values
    const taskTitle = document.getElementById("todo_input_deadline").value;
    const day = document.getElementById("day_input").value;
    const month = document.getElementById("month_input").value;
    const year = document.getElementById("year_input").value;

    // Get current date
    const currentDate = new Date();
    const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Format deadline date
    const deadlineDate = new Date(year, month - 1, day); // month - 1 because months are 0-based
    const formattedDeadlineDate = deadlineDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create card HTML
    const card = document.createElement("div");
    card.className = "card mb-3";
    card.draggable = true;

    if (deadlineDate.getDate() < currentDate.getDate()) {
        card.style.backgroundColor = "#CDA08B";
        card.innerHTML = `
        <div class="card-body">
            <div class="header-style">
                <h5 class="card-title" style="font-family:'Permanent Marker', cursive;font-weight: 400;font-style: normal;
                                                background: #775554;
                                                -webkit-background-clip: text;
                                                -webkit-text-fill-color: transparent;">
                ${taskTitle}</h5>
                <span class="close">&times;</span>
            </div>
            <div class="card-content">
                <p class="card-text">
                    <strong>Current:</strong> ${formattedCurrentDate}<br>
                    <strong>Deadline:</strong> ${formattedDeadlineDate}
                </p>
            </div>
        </div>
    `;
    } else if (deadlineDate.getDate() > currentDate.getDate()) {
        card.style.backgroundColor = "#775554";
        card.innerHTML = `
        <div class="card-body">
            <div class="header-style">
                <h5 class="card-title">${taskTitle}</h5>
                <span class="close">&times;</span>
            </div>
            <div class="card-content">
                <p class="card-text">
                    <strong>Current:</strong> ${formattedCurrentDate}<br>
                    <strong>Deadline:</strong> ${formattedDeadlineDate}
                </p>
            </div>
        </div>
    `;
    }else {
        card.style.backgroundColor = "#748cab";
        card.innerHTML = `
        <div class="card-body">
            <div class="header-style">
                <h5 class="card-title" style="font-family:'Permanent Marker', cursive;font-weight: 400;font-style: normal;
                                                background: #0D1321;
                                                -webkit-background-clip: text;
                                                -webkit-text-fill-color: transparent;">
                ${taskTitle}</h5>
                <span class="close">&times;</span>
            </div>
            <div class="card-content">
                <p class="card-text">
                    <strong>Current:</strong> ${formattedCurrentDate}<br>
                    <strong>Deadline:</strong> ${formattedDeadlineDate}
                </p>
            </div>
        </div>
    `;
    }

    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);

    // Save card to localStorage
    const cardData = {
        type: 'deadline',
        title: taskTitle,
        deadline: formattedDeadlineDate,
        status: 'todo'
    };
    saveCardToStorage(cardData);

    // Add card to todo container
    const todoContainer = document.querySelector(".todo-container");
    todoContainer.appendChild(card);

    // Clear inputs and close form
    document.getElementById("todo_input_deadline").value = "";
    document.getElementById("day_input").value = "";
    document.getElementById("month_input").value = "";
    document.getElementById("year_input").value = "";
    
    deadline_form.classList.remove("active");
    overlay.classList.remove("active");

    // Restore fixedposition class
    document.querySelectorAll('.move').forEach(moveElement => {
        moveElement.classList.add("fixedposition");
    });

    // Add event listener to the close button after the card is created
    const closeButton = card.querySelector('.close');
    closeButton.addEventListener('click', function() {
        const cardTitle = cardData.title; // Get the title to remove from localStorage
        card.remove(); // Remove the card from the UI
        removeCardFromStorage(cardTitle);// Remove the card when the close button is clicked
    });
}

// Add event listener for the deadline submit button
document.getElementById("deadline_submit").addEventListener("click", createDeadlineCard);

// Add event listener for atomic form submission
document.getElementById('atomic_submit').addEventListener('click', function() {
    const habitInput = document.getElementById('habit_input').value;
    const timeInput = document.getElementById('time_input').value;
    const outcomeInput = document.getElementById('outcome_input').value;

    if (habitInput && timeInput && outcomeInput) {
        // Create the card
        const card = createAtomicCard(habitInput, timeInput, outcomeInput, timesArray);
        document.querySelector('.todo-container').appendChild(card);
        
        // Clear inputs and close modal
        document.getElementById('habit_input').value = '';
        document.getElementById('time_input').value = '';
        document.getElementById('outcome_input').value = '';
        closeModal();
        
        // Clear the time items and reset timesArray when form is submitted
        const timeList = document.getElementById('time-list');
        while (timeList.firstChild) {
            timeList.removeChild(timeList.firstChild); // Remove all time items from the list
        }
        timesArray.length = 0; // Reset the timesArray after submission
    }
});

function createAtomicCard(habit, time, outcome, timesArray) {
    const card = document.createElement('div');
    card.className = 'card mb-3';
    card.draggable = true;
    card.id = habit;

    // Format the times array into a string
    const formattedTimes = timesArray.map(item => `${item.hours}:${item.minutes} ${item.format}`).join(', ');

    // Use backticks for string interpolation
    card.innerHTML = `
        <div class="card-body">
            <div class="header-style text-center mb-4" style="display: flex; justify-content: center; align-items: center; position: relative;">
                <h5 class="card-title" style="font-size: 32px; font-weight: bold; color: #2C3E50; margin: 0; text-align: center; width: 100%;">${habit}</h5>
            </div>
            <div class="atomic-section">
                <div class="text-center" style="color: #6A9C94; font-size: 16px; margin-bottom: 8px;">So I can Become</div>
                <div class="text-center" style="font-size: 22px; color: #CDA08B; font-weight: 500;">${outcome}</div>
            </div>
        </div>
        <div style="display: flex; justify-content: center; align-items: center; position: relative; text-align: center;">
            <span class="close" style="font-size: 24px; color: #6A9C94; cursor: pointer;">&times;</span>
        </div>
    `;

    // Add drag event listeners
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);
    
    // Add event listener to the close button after the card is created
    const closeButton = card.querySelector('.close');
    closeButton.addEventListener('click', function() {
        // Remove the card from the UI
        card.remove(); 
        
        // Optionally remove the card from localStorage (if you're using it)
        removeCardFromStorage(habit); // Use habit as the identifier
    });

    // Create card data
    const cardData = {
        type: 'atomic',
        title: habit,
        time: time,
        outcome: outcome,
        scheduledTimes: timesArray, // Store the timesArray with the card
        status: 'todo',
        done_number: 0
    };

    // Save the card data (assuming saveCardToStorage is implemented)
    saveCardToStorage(cardData);

    card.addEventListener('click', () => {
        // Display the form when the card is clicked
        displayForm(cardData);
    });

    // Optionally, you can push card data to a global array if you track all cards
    allCards.push(cardData);


    return card;
}

const atomicAddBtn = document.getElementById('atomic_add');
const timesArray = []; // This stores the times for the card

atomicAddBtn.addEventListener('click', () => {
    // Get the input values for time
    const timeHours = document.getElementById('time-hours').value;
    const timeMinutes = document.getElementById('time-minutes').value;
    const timeFormat = document.querySelector('input[name="time-format"]:checked');
  
    // Validate if the time format is selected
    if (!timeFormat) {
        alert('Please select AM or PM.');
        return;
    }
  
    // Validate hours and minutes are valid numbers
    if (isNaN(timeHours) || isNaN(timeMinutes)) {
        alert('Please enter valid numbers for hours and minutes.');
        return;
    }
  
    // Convert input values to integers
    const hours = parseInt(timeHours, 10);
    const minutes = parseInt(timeMinutes, 10);
  
    // Validate the range for hours and minutes
    if (hours < 1 || hours > 12) {
        alert('Please enter a valid hour (1-12 for 12-hour format).');
        return;
    }
  
    if (minutes < 0 || minutes > 59) {
        alert('Please enter valid minutes (0-59).');
        return;
    }
  
    // If everything is valid, add the time item to the array
    const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${timeFormat.value}`;

    // Create the time item div
    const timeItem = document.createElement('div');
    timeItem.innerHTML = `<p>${formattedTime}</p>`;

    // Append the time item to the list
    const timeList = document.getElementById('time-list');
    timeList.appendChild(timeItem);

    // Add event listener to remove time item
    timeItem.addEventListener('click', () => {
        timeItem.remove();

        // Remove the time item from the array
        const timeIndex = timesArray.findIndex(time => 
            time.hours === timeHours && time.minutes === timeMinutes && time.format === timeFormat.value
        );

        if (timeIndex !== -1) {
            timesArray.splice(timeIndex, 1);
        }
    });

    // Add the time item to the timesArray
    timesArray.push({
        hours: timeHours,
        minutes: timeMinutes,
        format: timeFormat.value
    });

    // Clear the time input fields
    document.getElementById('time-hours').value = '';
    document.getElementById('time-minutes').value = '';
    document.querySelector('input[name="time-format"]:checked').checked = false;
});

  
// This function runs continuously to check the scheduled times of all cards
function monitorScheduledTimes() {
    // Get the current time
    const currentTime = new Date();
    const formattedCurrentTime = formatTime(currentTime);

    // Check if any of the card times match the current time
    allCards.forEach(cardData => {
        if (cardData.scheduledTimes) {
            cardData.scheduledTimes.forEach(time => {
                const formattedScheduledTime = `${time.hours}:${time.minutes} ${time.format}`;

                // If a scheduled time matches the current time, trigger an alarm
                if (formattedScheduledTime === formattedCurrentTime) {
                    triggerAlarm(cardData);
                }
            });
        }
    });
}

// Function to retrieve all atomic type cards from localStorage
function getAllAtomicCardsFromStorage() {
    const allCards = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const cardData = JSON.parse(localStorage.getItem(key));
        if (cardData && cardData.type === 'atomic') {
            allCards.push(cardData);
        }
    }
    return allCards;
}

// Function to format current time to match the format stored in card data
function formatTime(date) {
    const hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const format = date.getHours() >= 12 ? 'PM' : 'AM';

    return `${hours}:${minutes} ${format}`;
}

// Function to trigger an alarm when the scheduled time matches the current time
let audioPlaying = false;  // Variable to track if audio is playing

function triggerAlarm(cardData) {
    // Get the task model (alarm) div
    const alarmDiv = document.getElementById('alarm_form');

    // Change the text content of the alarm to reflect the habit title
    const alarmText = document.getElementById('now_we_go');
    alarmText.textContent = `It's time for: ${cardData.title}`;

    // Add the 'active' class to make the alarm visible
    alarmDiv.classList.add('active');
    overlay.classList.add("active");

    playAlarmSound();
}

function playAlarmSound() {
    const audio = document.getElementById('alarm_sound_track');
    
    if (!audioPlaying) {
        audio.play();
        audioPlaying = true; // Set to true when sound is playing
    }
}

function stopAlarmSound() {
    const audio = document.getElementById('alarm_sound_track');
    
    if (audioPlaying) {
        audio.pause();
        audio.currentTime = 0; // Reset to start
        audioPlaying = false;  // Reset the flag when the sound is stopped
    }
}

function displayForm(cardData) {
    const alarmDiv = document.getElementById('atomic_display_form');

    atitle.textContent = `habit: ${cardData.title}`;
    aloc.textContent = `time/location: ${cardData.time}`;
    aso.textContent = `so i can become: ${cardData.outcome}`;
    adone.textContent = `Number of Completed times: ${cardData.done_number}`;
    if (cardData.scheduledTimes.length > 0) {
        areminder.textContent = `Reminder: ${cardData.scheduledTimes
          .map(time => `${time.hours}:${time.minutes} ${time.format}`)
          .join(', ')}`;
      } else {
        areminder.textContent = ''; // or any default message like "No reminders set"
      }
    alarmDiv.classList.add('active');
    overlay.classList.add("active");
} 


const close_btns = document.querySelectorAll(".close");

close_btns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Find the parent card element and remove it
    const card = btn.closest('.card');
    if (card) {
      card.remove();
    }
  });
});

// -------------------------------------------------------------------------------------------------------
let timer; // Timer variable
let isPaused = true; // Pause state, initially set to true to indicate paused state
let timeLeft; // Time left in milliseconds
let currentSession = 0; // Current session count
let totalSessions; // Total number of sessions
let totalTime; // Total time for the current session
let start_time;
let end_time;
// Global variables to store session settings
let pomodoroTime; // Duration of the pomodoro in seconds
let shortBreakDuration; // Duration of the short break in seconds
let longBreakDuration; // Duration of the long break in seconds

// Event listener for the submit button in the settings form
document.getElementById('submit_timer').addEventListener('click', () => {
    clearInterval(timer); // Stop the timer
    isPaused = true; // Set isPaused to true when settings are submitted
    document.getElementById('focus').innerText = 'Focus'; // Change button text to Start

    // Get values from the input fields
    totalSessions = ((document.getElementById('sessions').value) * 2) - 1;
    pomodoroTime = document.getElementById('pomodoroTime').value * 60 * 1000; // Convert to seconds
    shortBreakDuration = document.getElementById('shortBreak').value * 60 * 1000; // Convert to seconds
    longBreakDuration = document.getElementById('longBreak').value * 60 * 1000; // Convert to seconds
    currentSession = 0;
    // Store total time for progress calculation
    timeLeft = pomodoroTime; // Initial time in milliseconds
    totalTime = timeLeft;
    updateTimerDisplay();
    updateProgressBar();

    // Clear input fields (optional, if you still want to clear them)
    document.getElementById("sessions").value = "";
    document.getElementById("pomodoroTime").value = "";
    document.getElementById("shortBreak").value = "";
    document.getElementById("longBreak").value = "";

    const settingform = document.getElementById("setting-form");
    settingform.classList.remove("active");
    overlay.classList.remove("active");
});

// Event listener for the restart button (reset)
document.getElementById('rest').addEventListener('click', () => {
    clearInterval(timer); // Stop the timer
    isPaused = true;
    currentSession = 0; // Set isPaused to true when resetting
    timeLeft = pomodoroTime;
    totalTime = timeLeft;
    updateTimerDisplay(); // Update the display with the reset time
    updateProgressBar();
    document.getElementById('focus').innerText = 'Focus'; // Change button text back to "Start"
});

document.getElementById('skip').addEventListener('click', () => {
    clearInterval(timer); // Stop the timer
    isPaused = true;
    currentSession ++; // Set isPaused to true when resetting
    if (currentSession < totalSessions) {
        // If we are still in the work sessions, start a break
        if (currentSession % 2 === 1) {
            timeLeft = shortBreakDuration;
            document.getElementById('focus').innerText = 'Break'; // Short break (convert to milliseconds)
        } else {
            timeLeft = pomodoroTime;
            document.getElementById('focus').innerText = 'Focus'; // Start a new work session (convert to milliseconds)
        }
    } else {
        currentSession = -1; // Long break
        timeLeft = longBreakDuration;
        document.getElementById('focus').innerText = 'Break'; // Long break (convert to milliseconds)
    }
    totalTime = timeLeft; // Update total time for progress calculation
    updateTimerDisplay();
    updateProgressBar();
     // Change button text back to "Start"
});

// Event listener for the start button
document.getElementById('focus').addEventListener('click', () => {
    if (isPaused) {
        start_timer = new Date(); // Set start time when starting
        end_time = new Date(start_timer.getTime() + timeLeft); // Calculate end time based on timeLeft
        isPaused = false; // Timer is no longer paused
        startTimer(); // Start the timer
        document.getElementById('focus').innerText = 'Stop'; // Change button text to "Pause"
    } else {
        isPaused = true;
        clearInterval(timer); // Pause the timer
        document.getElementById('focus').innerText = 'Focus'; // Change button text back to "Start"
    }
});

// Function to start the timer
function startTimer() {
    timer = setInterval(() => {
        if (timeLeft > 0) {
            let cur_time = new Date(); // Get the current time
            timeLeft = end_time.getTime() - cur_time.getTime(); // Calculate remaining time in milliseconds
            updateTimerDisplay(); // Update the timer display
            updateProgressBar();
            monitorScheduledTimes(); // Update the progress bar
        } else {
            clearInterval(timer); // Stop the timer when time reaches 0
            isPaused = true; // Pause the timer automatically when it ends

            // Play the sound when the timer ends
            playTimerEndSound(); // Play bell sound

            currentSession++;
            if (currentSession < totalSessions) {
                // If we are still in the work sessions, start a break
                if (currentSession % 2 === 1) {
                    timeLeft = shortBreakDuration;
                    document.getElementById('focus').innerText = 'Break'; // Short break (convert to milliseconds)
                } else {
                    timeLeft = pomodoroTime;
                    document.getElementById('focus').innerText = 'Focus'; // Start a new work session (convert to milliseconds)
                }
            } else {
                currentSession = -1; // Long break
                timeLeft = longBreakDuration;
                document.getElementById('focus').innerText = 'Break'; // Long break (convert to milliseconds)
            }
            totalTime = timeLeft; // Update total time for progress calculation
            updateTimerDisplay();
            updateProgressBar();

            // Change the button text to "Start" after session ends
        }
    }, 1000); // Update every second
}

// Function to update the timer display
function updateTimerDisplay() {
    const minutes = Math.floor((timeLeft / 1000) / 60); // Convert milliseconds to minutes
    const seconds = Math.floor((timeLeft / 1000) % 60); // Convert milliseconds to seconds
    document.getElementById('timer').innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Function to update the progress bar
function updateProgressBar() {
    const radius = 67.5; // New radius for circular progress bar
    const circumference = 2 * Math.PI * radius; // Update circumference calculation
    const progressCircle = document.querySelector('.progress');
    const offset = circumference - (timeLeft / totalTime) * circumference; // Update offset calculation
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = offset;
}

// Function to handle the timer end and play sound
function playTimerEndSound() {
    const audio = document.getElementById('timer-end-sound');
    audio.play().catch(error => {
        console.error("Error playing sound:", error);

        // If play() fails (e.g., due to autoplay restrictions), play the sound manually on user interaction
        document.getElementById('focus').addEventListener('click', () => {
            audio.play().catch(err => console.error("Error playing sound after user interaction:", err));
        });
    });
}

// Initialize the timer when the page loads
window.onload = () => {
    timeLeft = 30 * 60 * 1000; // 30 minutes in milliseconds
    totalSessions = 7; // Default number of sessions
    totalTime = 30 * 60 * 1000; // Default total time in milliseconds
    pomodoroTime = totalTime; // Default work time
    shortBreakDuration = 10 * 60 * 1000; // 10-minute short break
    longBreakDuration = 15 * 60 * 1000; // 15-minute long break
    updateTimerDisplay(); // Update display
    loadCards(); 
};
