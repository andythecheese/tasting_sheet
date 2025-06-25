// --- Supabase Configuration ---
// IMPORTANT: Replace with your actual Supabase Project URL and Anon Key
// You can find these in your Supabase Dashboard under Project Settings > API
const SUPABASE_URL = 'https://bzyxxtghfayontoepxoz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6eXh4dGdoZmF5b250b2VweG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzAwODcsImV4cCI6MjA2NjQ0NjA4N30.CW_LUMy49pB8CSjJn1PAA5By24G8NUmcgj7LIHoItUo';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth state changed:", event, session); // Log the event and session for debugging

    if (session) {
        // User is logged in
        authSection.classList.add('hidden'); // Hide the login/signup section
        tastingForm.classList.remove('hidden'); // Show the tasting form
        logoutButton.classList.remove('hidden'); // Show the logout button
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

    // Check if email and password are provided
    if (!email || !password) {
        alert('Please enter both email and password to sign up.');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            // Display specific error messages from Supabase
            alert('Signup error: ' + error.message);
            console.error('Signup error:', error);
        } else {
            // Check if user object is returned (means email confirmation might be off)
            if (data.user) {
                alert('Sign-up successful! You are now logged in.');
            } else {
                // If user data is null, it means email confirmation is likely on
                alert('Sign-up successful! Please check your email to confirm your account (if email confirmation is enabled in Supabase).');
                authHeading.textContent = 'Please check your email to confirm your account!';
                signupButton.classList.add('hidden');
                loginButton.classList.add('hidden');
            }
        }
    } catch (err) {
        // Catch any unexpected errors during the signup process
        alert('An unexpected error occurred during signup. Please try again.');
        console.error('Unexpected signup error:', err);
    }
});

// Event listener for the Login button
loginButton.addEventListener('click', async () => {
    const email = authEmailInput.value;
    const password = authPasswordInput.value;

    // Check if email and password are provided
    if (!email || !password) {
        alert('Please enter both email and password to log in.');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            // Display specific error messages from Supabase
            alert('Login error: ' + error.message);
            console.error('Login error:', error);
        } else {
            alert('Logged in successfully!');
        }
    } catch (err) {
        // Catch any unexpected errors during the login process
        alert('An unexpected error occurred during login. Please try again.');
        console.error('Unexpected login error:', err);
    }
});

// Event listener for the Logout button
logoutButton.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            alert('Logout error: ' + error.message);
            console.error('Logout error:', error);
        } else {
            alert('Logged out successfully!');
        }
    } catch (err) {
        // Catch any unexpected errors during the logout process
        alert('An unexpected error occurred during logout. Please try again.');
        console.error('Unexpected logout error:', err);
    }
});

// --- Form Submission Handler ---
// Event listener for the tasting form submission
tastingForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission to handle it with JavaScript

    // Get the current user's session to retrieve their ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        // If there's no user or an error getting the user, prompt to log in
        alert('You must be logged in to save a tasting entry. Please log in or sign up.');
        console.error('User not logged in or error getting user:', userError);
        return;
    }

    // Collect form data from various input fields
    const formData = {
        cheese_name: document.getElementById('cheeseName').value || null,
        cheesemaker_country_region: document.getElementById('cheesemakerCountryRegion').value || null,
        date_tasted: document.getElementById('dateTasted').value || null,
        where_bought: document.getElementById('whereBought').value || null,
        cost: parseFloat(document.getElementById('cost').value) || null, // Convert to number, handle empty or invalid
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
        final_notes: document.getElementById('finalNotes').value || null,
        user_id: user.id // Assign the current user's ID
    };

    console.log("Submitting data:", formData); // Log the data being submitted

    try {
        const { data, error } = await supabase
            .from('cheese_tastings') // Your table name
            .insert([formData]); // Insert the collected form data

        if (error) {
            alert('Error saving entry: ' + error.message);
            console.error('Submission error:', error);
        } else {
            alert('Tasting entry saved successfully!');
            tastingForm.reset(); // Clear the form after successful submission
        }
    } catch (err) {
        // Catch any unexpected errors during the insertion process
        alert('An unexpected error occurred while saving the entry. Please try again.');
        console.error('Unexpected submission error:', err);
    }
});

// Initial check on page load to see if a user is already logged in
// This will trigger the onAuthStateChange listener if a session exists.
supabase.auth.getSession();