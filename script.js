// --- Firebase Configuration ---
// IMPORTANT: Your Firebase project's config.
const firebaseConfig = {
    apiKey: "AIzaSyADHliPkS4_GsL7rP89PU4ALXnajhkZgcg",
    authDomain: "tastingsheet-ef85d.firebaseapp.com",
    projectId: "tastingsheet-ef85d",
    storageBucket: "tastingsheet-ef85d.firebasestorage.app",
    messagingSenderId: "941831901091",
    appId: "1:941831901091:web:481d2f324e6e34fcad1416",
    measurementId: "G-QZTEC72KFR" // Note: Measurement ID for Analytics, not directly used in core logic
};

// --- Firebase Imports (These load the necessary Firebase libraries) ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    deleteDoc,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM Elements ---
// Get references to various HTML elements by their IDs
const authSection = document.getElementById('auth-section');
const authHeading = document.getElementById('auth-heading');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const signupButton = document.getElementById('signup-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const tastingForm = document.getElementById('tasting-form');

// --- Auth State Listener ---
// This function runs whenever the user's authentication state changes (e.g., login, logout).
onAuthStateChanged(auth, (user) => {
    console.log("Auth state changed, user:", user); // Log the user object for debugging

    if (user) {
        // User is logged in
        authSection.classList.add('hidden'); // Hide the login/signup section
        tastingForm.classList.remove('hidden'); // Show the tasting form
        logoutButton.classList.remove('hidden'); // Show the logout button
        // You could fetch and display user's specific tasting sheets here if needed
        // For example: fetchTastingSheets(user.uid);
    } else {
        // User is logged out
        authSection.classList.remove('hidden'); // Show the login/signup section
        authHeading.textContent = 'Sign Up or Log In'; // Reset heading text
        signupButton.classList.remove('hidden'); // Show signup button
        loginButton.classList.remove('hidden'); // Show login button
        logoutButton.classList.add('hidden'); // Hide logout button
        tastingForm.classList.add('hidden'); // Hide the tasting form
        authEmailInput.value = ''; // Clear email input
        authPasswordInput.value = ''; // Clear password input
    }
});

// --- Authentication Functions ---

// Event listener for the Signup button
signupButton.addEventListener('click', async () => {
    const email = authEmailInput.value;
    const password = authPasswordInput.value;

    // Basic validation
    if (!email || !password) {
        alert('Please enter both email and password to sign up.');
        return;
    }
    if (password.length < 6) { // Firebase requires a minimum of 6 characters for password
        alert('Password must be at least 6 characters long.');
        return;
    }

    try {
        // Use Firebase Auth to create a new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        alert('Sign-up successful! Welcome, ' + user.email + '!');
        console.log('Signed up user:', user);
        // The onAuthStateChanged listener will handle UI update

    } catch (error) {
        // Handle common Firebase authentication errors
        let errorMessage = 'Signup error: ' + error.message;
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'This email is already in use. Please try logging in or use a different email.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'The email address is not valid.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'The password is too weak. Please choose a stronger one.';
        }
        alert(errorMessage);
        console.error('Signup error:', error);
    }
});

// Event listener for the Login button
loginButton.addEventListener('click', async () => {
    const email = authEmailInput.value;
    const password = authPasswordInput.value;

    // Basic validation
    if (!email || !password) {
        alert('Please enter both email and password to log in.');
        return;
    }

    try {
        // Use Firebase Auth to sign in an existing user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        alert('Logged in successfully! Welcome back, ' + user.email + '!');
        console.log('Logged in user:', user);
        // The onAuthStateChanged listener will handle UI update

    } catch (error) {
        // Handle common Firebase authentication errors
        let errorMessage = 'Login error: ' + error.message;
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            errorMessage = 'Incorrect email or password. Please try again.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'The email address is not valid.';
        }
        alert(errorMessage);
        console.error('Login error:', error);
    }
});

// Event listener for the Logout button
logoutButton.addEventListener('click', async () => {
    try {
        // Use Firebase Auth to sign out the current user
        await signOut(auth);
        alert('Logged out successfully!');
        console.log('User logged out.');
        // The onAuthStateChanged listener will handle UI update

    } catch (error) {
        alert('Logout error: ' + error.message);
        console.error('Logout error:', error);
    }
});

// --- Form Submission Handler (for saving data to Firestore) ---
tastingForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const user = auth.currentUser; // Get the currently logged-in user from Firebase Auth

    if (!user) {
        alert('You must be logged in to save a tasting entry. Please log in or sign up.');
        console.warn('Attempted to save tasting entry without a logged-in user.');
        return;
    }

    // Collect form data. Use '|| null' or '|| []' for checkboxes to ensure correct types for Firestore.
    const formData = {
        user_id: user.uid, // Store the Firebase user's unique ID
        created_at: new Date(), // Timestamp for when the entry was created

        cheese_name: document.getElementById('cheeseName').value || null,
        cheesemaker_country_region: document.getElementById('cheesemakerCountryRegion').value || null,
        date_tasted: document.getElementById('dateTasted').value || null,
        where_bought: document.getElementById('whereBought').value || null,
        cost: parseFloat(document.getElementById('cost').value) || null,

        milk_source: document.querySelector('input[name="milkSource"]:checked')?.value || null,
        milk_source_other: document.getElementById('milkSourceOther').value || null,
        milk_treatment: document.querySelector('input[name="milkTreatment"]:checked')?.value || null,
        milk_treatment_other: document.getElementById('milkTreatmentOther').value || null,

        rind_type: Array.from(document.querySelectorAll('input[name="rindType"]:checked')).map(cb => cb.value),
        rind_comment: document.getElementById('rindComment').value || null,
        paste_texture: parseInt(document.querySelector('input[name="pasteTexture"]:checked')?.value) || null,
        consistency: Array.from(document.querySelectorAll('input[name="consistency"]:checked')).map(cb => cb.value),
        colour: Array.from(document.querySelectorAll('input[name="colour"]:checked')).map(cb => cb.value),
        blueing: Array.from(document.querySelectorAll('input[name="blueing"]:checked')).map(cb => cb.value),
        paste_comment: document.getElementById('pasteComment').value || null,

        smell_intensity: parseInt(document.querySelector('input[name="smellIntensity"]:checked')?.value) || null,
        smell_ammonia: parseInt(document.querySelector('input[name="smellAmmonia"]:checked')?.value) || null,
        smell_comment: document.getElementById('smellComment').value || null,

        flavour_sweet: parseInt(document.querySelector('input[name="flavourSweet"]:checked')?.value) || null,
        flavour_salt: parseInt(document.querySelector('input[name="flavourSalt"]:checked')?.value) || null,
        flavour_savoury: parseInt(document.querySelector('input[name="flavourSavoury"]:checked')?.value) || null,
        flavour_bitter: parseInt(document.querySelector('input[name="flavourBitter"]:checked')?.value) || null,
        flavour_acidity: parseInt(document.querySelector('input[name="flavourAcidity"]:checked')?.value) || null,
        simple_flavours_comment: document.getElementById('simpleFlavoursComment').value || null,

        complex_dairy: parseInt(document.querySelector('input[name="complexDairy"]:checked')?.value) || null,
        complex_fruity_floral: parseInt(document.querySelector('input[name="complexFruityFloral"]:checked')?.value) || null,
        complex_veg_herbaceous: parseInt(document.querySelector('input[name="complexVegHerb"]:checked')?.value) || null,
        complex_mineral_chemical: parseInt(document.querySelector('input[name="complexMineralChemical"]:checked')?.value) || null,
        complex_flavours_comment: document.getElementById('complexFlavoursComment').value || null,

        make_type: Array.from(document.querySelectorAll('input[name="makeType"]:checked')).map(cb => cb.value),
        post_make_details: Array.from(document.querySelectorAll('input[name="postMakeDetails"]:checked')).map(cb => cb.value),
        post_make_comment: document.getElementById('postMakeComment').value || null,

        pairings: document.getElementById('pairings').value || null,
        taste_complexity: document.querySelector('input[name="tasteComplexity"]:checked')?.value || null,
        length: document.querySelector('input[name="length"]:checked')?.value || null,
        ripeness: document.querySelector('input[name="ripeness"]:checked')?.value || null,
        overall_rating: parseInt(document.getElementById('overallRating').value) || null,
        final_notes: document.getElementById('finalNotes').value || null
    };

    console.log("Submitting data to Firestore:", formData);

    try {
        // Add a new document to the 'cheese_tastings' collection in Firestore
        // The addDoc function automatically generates a unique ID for the document
        const docRef = await addDoc(collection(db, 'cheese_tastings'), formData);
        alert('Tasting entry saved successfully with ID: ' + docRef.id + '!');
        tastingForm.reset(); // Clear the form after successful submission
        console.log('Document written with ID: ', docRef.id);
    } catch (e) {
        alert('Error saving entry: ' + e.message);
        console.error('Error adding document: ', e);
    }
});

// --- Firestore Security Rules ---
// For Firestore, you'll also need to set up security rules in your Firebase Console.
// Here's a basic set of rules you can use. Go to Firebase Console -> Firestore Database -> Rules tab,
// and replace the default rules with these:
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rules for the 'cheese_tastings' collection
    match /cheese_tastings/{tastingId} {
      // Allow read and write access only if the user is authenticated and the user_id matches
      allow read, write: if request.auth != null && request.auth.uid == resource.data.user_id;
    }
  }
}
*/
// These rules ensure that only the authenticated user who created a tasting entry can read or write it.