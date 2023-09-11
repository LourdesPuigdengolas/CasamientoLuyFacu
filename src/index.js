import { initializeApp } from "firebase/app";
import { 
    getFirestore, collection, getDocs, doc, runTransaction
 } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBBIhSTYHOSWqGJO-peB_ujwo74H9L0Je4",
    authDomain: "wedding-f9e01.firebaseapp.com",
    projectId: "wedding-f9e01",
    storageBucket: "wedding-f9e01.appspot.com",
    messagingSenderId: "281501470356",
    appId: "1:281501470356:web:1811b82a2ec2bb4bcdee81"
};


//  init firebase app
initializeApp(firebaseConfig);

//  init services
const db = getFirestore()

//  collection reference
const colRef = collection(db, 'Regalos')

// _________________________________________________________________________________________________________________________

let regalos = [];


// Función para mostrar los datos de la colección
const mostrarRegalos = async () => {

    

    try {
        const querySnapshot = await getDocs(colRef);
        const regalos = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            originalStock: doc.data().Stock // Almacenar el valor original de Stock
        }));

        const primeraColumna = document.getElementById('regalos-column-1');
        const segundaColumna = document.getElementById('regalos-column-2');
        
        regalos.forEach((regalo, index) => {
            const isChecked = regalo.Stock ? 'checked' : '';
            const disabledAttr = regalo.Stock ? 'disabled' : '';

            const checkboxHtml = `<input type="checkbox" ${isChecked} ${disabledAttr} data-id="${regalo.id}" data-title="${regalo.title}">`;
            const regaloText = `<span class="regalo-text ${isChecked ? 'checked' : ''}">${regalo.title}</span>`;
        
            const regaloHtml = `<div class=""><p>${checkboxHtml} ${regaloText}</p></div>`;
        
            // const regaloHtml = `<div class="regalos-ind"> <p>${regalo.title} </p> <input type="checkbox" ${isChecked} ${disabledAttr} data-id="${regalo.id}" data-title="${regalo.title}"></div>`;
            if (index < 11) {
                primeraColumna.innerHTML += regaloHtml;
            } else {
                segundaColumna.innerHTML += regaloHtml;
            }
        });

        // Agregar event listener para los checkboxes
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
            checkbox.addEventListener('change', (event) => {
                const checkbox = event.target;
                const regaloId = checkbox.getAttribute('data-id');

                // Habilitar el botón de "Guardar cambios"
                guardarCambiosButton.disabled = false;
                guardarCambiosButton.setAttribute('data-id', regaloId);

                // Restaurar la habilidad de checkbox al valor original de Stock
                const regalo = regalos.find((regalo) => regalo.id === regaloId);
                if (regalo && regalo.Stock !== regalo.originalStock) {
                    checkbox.disabled = false;
                }

                // Mostrar el modal con el nombre del regalo
                // if (checkbox.checked) {
                //     console.log("Mostrando modal");
                //     $("#myModal").modal("show");
                //     $("#modal-body").html(`<h2>HOLAAAAA "${regalo.title}"</h2>`);
                // }
                // console.log(checkbox.checked)
            });
        });
    } catch (error) {
        console.log(error.message);
    }
};



// Mostrar los regalos al cargar la página
mostrarRegalos();


// Agregar un event listener al botón de "Guardar cambios"
const guardarCambiosButton = document.getElementById("guardar-cambios");
guardarCambiosButton.addEventListener('click', async () => {
    const regaloId = guardarCambiosButton.getAttribute('data-id');
    if (regaloId) {
        const checkbox = document.querySelector(`input[data-id="${regaloId}"]`);
        if (checkbox) {
            try {
                const transactionResult = await runTransaction(db, async (transaction) => {
                    const regaloRef = doc(db, 'Regalos', regaloId);
                    const regaloSnapshot = await transaction.get(regaloRef);
                    
                    if (!regaloSnapshot.exists()) {
                        throw new Error('El regalo no existe');
                    }
                    console.log(transactionResult)
                    // Leer el valor actual de Stock
                    const stockActual = regaloSnapshot.data().Stock;
                    
                    // Actualizar el valor de Stock en la base de datos
                    transaction.update(regaloRef, { Stock: checkbox.checked });
                    
                    return stockActual;
                });

                console.log("Actualización exitosa");

                // Deshabilitar el checkbox y el botón después de guardar los cambios
                checkbox.disabled = true;
                checkbox.removeAttribute('data-id');
                guardarCambiosButton.disabled = true;

                // Actualizar el valor original de Stock
                const regalo = regalos.find((regalo) => regalo.id === regaloId);
                if (regalo) {
                    regalo.originalStock = checkbox.checked;
                }

                // Recargar la página automáticamente después de guardar los cambios
                location.reload();
            } catch (error) {
                console.error('Error actualizando datos:', error);
            }
        }
    }
});