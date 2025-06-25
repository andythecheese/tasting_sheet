// --- Supabase Configuration ---
const SUPABASE_URL = 'https://uwmoymvagoznpsmitkho.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bW95bXZhZ296bnBzbWl0a2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjE5MzksImV4cCI6MjA2NjQzNzkzOX0.CW9KXwPyl4igtpBo2GQ2i2a5IwDeLWcNV2cT6XXyVgo';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- DOM Elements ---
const authSection = document.getElementById('auth-section');
const authHeading = document.getElementById('auth-heading');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const signupButton = document.getElementById('signup-button');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const tastingForm = document.getElementById('tasting-form');

// --- Auth State Listener ---
supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth state changed:", event, session);
    if (session) {
        // User is logged in
        authSection.classList.add('hidden');
        tastingForm.classList.remove('hidden');
        logoutButton.classList.remove('hidden'); // Show logout button when logged in
    } else {
        // User is logged out
        authSection.classList.remove('hidden');
        authHeading.textContent = 'Sign Up or Log In';
        signupButton.classList.remove('hidden');
        loginButton.classList.remove('hidden');
        logoutButton.classList.add('hidden'); // Hide logout button when logged out
        tastingForm.classList.add('hidden');
        authEmailInput.value = '';
        authPasswordInput.value = '';
    }
});

// --- Authentication Functions ---
signupButton.addEventListener('click', async () => {
    const email = authEmailInput.value;
    const password = authPasswordInput.value;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
        alert('Signup error: ' + error.message);
    } else {
        alert('Sign-up successful! Check your email for confirmation (if email confirmation is enabled in Supabase).');
        if (!data.user) {
             authHeading.textContent = 'Please check your email to confirm your account!';
             signupButton.classList.add('hidden');
             loginButton.classList.add('hidden');
        }
    }
});

loginButton.addEventListener('click', async () => {
    const email = authEmailInput.value;
    const password = authPasswordInput.value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        alert('Login error: ' + error.message);
    } else {
        alert('Logged in successfully!');
    }
});

logoutButton.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert('Logout error: ' + error.message);
    } else {
        alert('Logged out successfully!');
    }
});

// --- Form Submission Handler ---
tastingForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
        alert('You must be logged in to save a tasting entry.');
        return;
    }

    // Collect form data
    const formData = {
        cheese_name: document.getElementById('cheeseName').value,
        cheesemaker_country_region: document.getElementById('cheesemakerCountryRegion').value,
        date_tasted: document.getElementById('dateTasted').value,
        where_bought: document.getElementById('whereBought').value,
        cost: parseFloat(document.getElementById('cost').value) || null, // Convert to number, handle empty
        milk_source: document.querySelector('input[name="milkSource"]:checked')?.value || null,
        milk_source_other: document.getElementById('milkSourceOther').value || null,
        milk_treatment: document.querySelector('input[name="milkTreatment"]:checked')?.value || null,
        milk_treatment_other: document.getElementById('milkTreatmentOther').value || null,
        rind_type: Array.from(document.querySelectorAll('input[name="rindType"]:checked')).map(cb => cb.value),
        rind_comment: document.getElementById('rindComment').value,
        paste_texture: parseInt(document.querySelector('input[name="pasteTexture"]:checked')?.value) || null,
        consistency: Array.from(document.querySelectorAll('input[name="consistency"]:checked')).map(cb => cb.value),
        colour: Array.from(document.querySelectorAll('input[name="colour"]:checked')).map(cb => cb.value),
        blueing: Array.from(document.querySelectorAll('input[name="blueing"]:checked')).map(cb => cb.value),
        paste_comment: document.getElementById('pasteComment').value,
        smell_intensity: parseInt(document.querySelector('input[name="smellIntensity"]:checked')?.value) || null,
        smell_ammonia: parseInt(document.querySelector('input[name="smellAmmonia"]:checked')?.value) || null,
        smell_comment: document.getElementById('smellComment').value,
        flavour_sweet: parseInt(document.querySelector('input[name="flavourSweet"]:checked')?.value) || null,
        flavour_salt: parseInt(document.querySelector('input[name="flavourSalt"]:checked')?.value) || null,
        flavour_savoury: parseInt(document.querySelector('input[name="flavourSavoury"]:checked')?.value) || null,
        flavour_bitter: parseInt(document.querySelector('input[name="flavourBitter"]:checked')?.value) || null,
        flavour_acidity: parseInt(document.querySelector('input[name="flavourAcidity"]:checked')?.value) || null,
        simple_flavours_comment: document.getElementById('simpleFlavoursComment').value,
        complex_dairy: parseInt(document.querySelector('input[name="complexDairy"]:checked')?.value) || null,
        complex_fruity_floral: parseInt(document.querySelector('input[name="complexFruityFloral"]:checked')?.value) || null,
        complex_veg_herbaceous: parseInt(document.querySelector('input[name="complexVegHerb"]:checked')?.value) || null,
        complex_mineral_chemical: parseInt(document.querySelector('input[name="complexMineralChemical"]:checked')?.value) || null,
        complex_flavours_comment: document.getElementById('complexFlavoursComment').value,
        make_type: Array.from(document.querySelectorAll('input[name="makeType"]:checked')).map(cb => cb.value),
        post_make_details: Array.from(document.querySelectorAll('input[name="postMakeDetails"]:checked')).map(cb => cb.value),
        post_make_comment: document.getElementById('postMakeComment').value,
        pairings: document.getElementById('pairings').value,
        taste_complexity: document.querySelector('input[name="tasteComplexity"]:checked')?.value || null,
        length: document.querySelector('input[name="length"]:checked')?.value || null,
        ripeness: document.querySelector('input[name="ripeness"]:checked')?.value || null,
        overall_rating: parseInt(document.getElementById('overallRating').value) || null,
        final_notes: document.getElementById('finalNotes').value,
        user_id: user.data.user.id // Assign the current user's ID
    };

    console.log("Submitting data:", formData);

    const { data, error } = await supabase
        .from('cheese_tastings') // Your table name
        .insert([formData]);

    if (error) {
        alert('Error saving entry: ' + error.message);
        console.error('Submission error:', error);
    } else {
        alert('Tasting entry saved successfully!');
        tastingForm.reset(); // Clear the form
    }
});

// Initial check on page load to see if a user is already logged in
supabase.auth.getSession();