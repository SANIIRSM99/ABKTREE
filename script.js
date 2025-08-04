try {
    let profiles = JSON.parse(localStorage.getItem("profiles")) || [
        {
            name: "Hazrat Sultan Abulkhair Shah",
            fatherName: "",
            cnic: "ROOT001",
            fatherCNIC: "",
            bloodGroup: "O+",
            phone: "",
            address: "",
            dob: "",
            gender: "male",
            status: "deceased",
            deathDate: "1950-01-01",
            note: "یہ حضرت علیؓ کے بیٹے حضرت عباسؓ کے شجرہ سے ہیں",
            photo: ""
        }
    ];

    let currentUser = localStorage.getItem("currentUser") || "";
    let currentMonth = new Date();
    let fundsReceived = JSON.parse(localStorage.getItem(getFundsKey("fundsReceived", currentMonth))) || [];
    let fundsUsed = JSON.parse(localStorage.getItem(getFundsKey("fundsUsed", currentMonth))) || [];
    let currentBalance = parseFloat(localStorage.getItem(getBalanceKey(currentMonth))) || 0;

    // Generate localStorage key for funds by month-year
    function getFundsKey(type, date) {
        const month = date.getMonth() + 1; // 1-12
        const year = date.getFullYear();
        return `${type}_${year}-${month.toString().padStart(2, '0')}`;
    }

    // Generate localStorage key for balance by month-year
    function getBalanceKey(date) {
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `balance_${year}-${month.toString().padStart(2, '0')}`;
    }

    // Save Profiles to LocalStorage
    function saveProfiles() {
        try {
            localStorage.setItem("profiles", JSON.stringify(profiles));
        } catch (e) {
            console.error("Failed to save profiles to localStorage:", e);
            alert("Error saving profiles. Check browser storage permissions.");
        }
    }

    // Save Funds and Balance to LocalStorage
    function saveFunds() {
        try {
            localStorage.setItem(getFundsKey("fundsReceived", currentMonth), JSON.stringify(fundsReceived));
            localStorage.setItem(getFundsKey("fundsUsed", currentMonth), JSON.stringify(fundsUsed));
            localStorage.setItem(getBalanceKey(currentMonth), currentBalance.toFixed(2));
        } catch (e) {
            console.error("Failed to save funds to localStorage:", e);
            alert("Error saving funds. Check browser storage permissions.");
        }
    }

    // Show Duplicate Alert
    function showDuplicateAlert(msg) {
        try {
            const alertBox = document.getElementById("duplicateAlert");
            if (alertBox) {
                alertBox.textContent = msg;
                alertBox.style.display = "block";
                setTimeout(() => (alertBox.style.display = "none"), 5000);
            } else {
                console.error("Duplicate alert box not found in DOM");
                alert("Duplicate alert box not found!");
            }
        } catch (e) {
            console.error("Error showing duplicate alert:", e);
        }
    }

    // LOGIN
    function login() {
        try {
            const user = document.getElementById("username")?.value.trim();
            const pass = document.getElementById("password")?.value.trim();
            const errorBox = document.getElementById("loginError");

            if (!user || !pass || !errorBox) {
                console.error("Login inputs or error box not found");
                alert("Login form elements missing!");
                return;
            }

            if ((user === "Abk" && pass === "bastiabk") || (user === "cpabk" && pass === "985973abk")) {
                currentUser = user;
                localStorage.setItem("currentUser", currentUser);
                document.getElementById("loginBox").style.display = "none";
                document.getElementById("app").style.display = "block";
                if (window.location.pathname.includes("funds.html")) {
                    renderFunds();
                } else {
                    renderTree();
                }
            } else {
                errorBox.textContent = "Invalid Username or Password!";
            }
        } catch (e) {
            console.error("Login error:", e);
            alert("Error during login: " + e.message);
        }
    }

    // LOGOUT
    function logout() {
        try {
            currentUser = "";
            localStorage.removeItem("currentUser");
            document.getElementById("app").style.display = "none";
            document.getElementById("loginBox").style.display = "block";
            window.location.href = "index.html";
        } catch (e) {
            console.error("Logout error:", e);
            alert("Error during logout: " + e.message);
        }
    }

    // FORM OPEN/CLOSE
    function openForm(fatherCnic = "") {
        try {
            const formPanel = document.getElementById("formPanel");
            const profileForm = document.getElementById("profileForm");
            if (!formPanel || !profileForm) {
                console.error("Form panel or profile form not found");
                alert("Form elements missing!");
                return;
            }
            formPanel.classList.add("active");
            profileForm.reset();
            document.getElementById("editCnic").value = "";
            document.getElementById("fatherCnic").value = fatherCnic;

            if (fatherCnic) {
                const father = profiles.find(p => p.cnic === fatherCnic);
                if (father) document.getElementById("fatherName").value = father.name;
            }

            document.getElementById("marriedSection").style.display = "none";
            document.getElementById("spouseCnic").style.display = "none";
            document.getElementById("spouseName").style.display = "none";
        } catch (e) {
            console.error("Error opening form:", e);
            alert("Error opening form: " + e.message);
        }
    }

    function closeForm() {
        try {
            const formPanel = document.getElementById("formPanel");
            if (formPanel) formPanel.classList.remove("active");
        } catch (e) {
            console.error("Error closing form:", e);
        }
    }

    // PROFILE MODAL
    function showProfile(cnic) {
        try {
            const p = profiles.find(p => p.cnic === cnic);
            if (!p) {
                console.error("Profile not found for CNIC:", cnic);
                alert("Profile not found!");
                return;
            }

            const age = calculateAge(p.dob, p.status === "deceased" ? p.deathDate : null);
            const eligible = isEligibleForVote(p);
            const voteMsg = eligible ? `✔ Eligible to Vote` : `❌ Not Eligible`;

            const photoHTML = p.photo ? `<img src="${p.photo}" class="modal-photo">` : `<p style="text-align:center;color:#888;">No Photo</p>`;

            const formattedDob = p.dob ? formatDMYDate(new Date(p.dob)) : "-";
            const formattedDeathDate = p.deathDate && p.status === "deceased" ? formatDMYDate(new Date(p.deathDate)) : "";

            const modalBody = `
                ${photoHTML}
                <p><b>Name:</b> ${p.name}</p>
                <p><b>Father:</b> ${p.fatherName || "-"}</p>
                <p><b>CNIC:</b> ${p.cnic}</p>
                <p><b>Blood Group:</b> ${p.bloodGroup}</p>
                <p><b>Phone:</b> ${p.phone || "-"}</p>
                <p><b>Address:</b> ${p.address || "-"}</p>
                <p><b>Date of Birth:</b> ${formattedDob}</p>
                <p><b>Status:</b> ${p.status}</p>
                ${formattedDeathDate ? `<p><b>Date of Death:</b> ${formattedDeathDate}</p>` : ""}
                <p><b>Age:</b> ${age !== null ? age + " years" : "-"}</p>
                <p style="color:${eligible ? 'green' : 'red'};"><b>Vote Status:</b> ${voteMsg}</p>
                ${p.spouseName ? `<p><b>Spouse:</b> ${p.spouseName}</p>` : ""}
                ${p.note ? `<p style="color:#005f73;font-weight:bold;">${p.note}</p>` : ""}
            `;
            const modal = document.getElementById("profileModal");
            if (modal) {
                document.getElementById("modalBody").innerHTML = modalBody;
                modal.style.display = "flex";
            } else {
                console.error("Profile modal not found");
                alert("Profile modal not found!");
            }
        } catch (e) {
            console.error("Error showing profile:", e);
            alert("Error showing profile: " + e.message);
        }
    }

    function closeModal() {
        try {
            const modal = document.getElementById("profileModal");
            if (modal) modal.style.display = "none";
        } catch (e) {
            console.error("Error closing modal:", e);
        }
    }

    // Calculate Age
    function calculateAge(dob, deathDate = null) {
        try {
            if (!dob) return null;
            const birth = new Date(dob);
            const endDate = deathDate ? new Date(deathDate) : new Date();
            let age = endDate.getFullYear() - birth.getFullYear();
            const m = endDate.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && endDate.getDate() < birth.getDate())) age--;
            return age;
        } catch (e) {
            console.error("Error calculating age:", e);
            return null;
        }
    }

    // Check Vote Eligibility
    function isEligibleForVote(profile) {
        try {
            if (profile.status === "deceased") return false;
            const age = calculateAge(profile.dob);
            return age !== null && age >= 18;
        } catch (e) {
            console.error("Error checking vote eligibility:", e);
            return false;
        }
    }

    // Update Vote Summary
    function updateVoteSummary() {
        try {
            const totalProfiles = profiles.length;
            const aliveProfiles = profiles.filter(p => p.status === "alive");
            const voteEligible = aliveProfiles.filter(p => isEligibleForVote(p));

            const voteSummary = document.getElementById("voteSummary");
            if (voteSummary) {
                voteSummary.innerHTML = `
                    <b>Total:</b> ${totalProfiles} | 
                    <b>Alive:</b> ${aliveProfiles.length} | 
                    <b>Eligible Votes:</b> ${voteEligible.length}
                `;
            } else {
                console.error("Vote summary element not found");
            }
        } catch (e) {
            console.error("Error updating vote summary:", e);
        }
    }

    // SAVE PROFILE
    function getBase64(file, callback) {
        try {
            const reader = new FileReader();
            reader.onload = e => callback(e.target.result);
            reader.readAsDataURL(file);
        } catch (e) {
            console.error("Error reading file:", e);
        }
    }

    document.getElementById("profileForm")?.addEventListener("submit", function (e) {
        try {
            e.preventDefault();
            const photoFile = document.getElementById("profilePhoto")?.files[0];
            if (photoFile) {
                getBase64(photoFile, base64Image => saveProfile(base64Image));
            } else {
                saveProfile("");
            }
        } catch (e) {
            console.error("Error submitting profile form:", e);
            alert("Error saving profile: " + e.message);
        }
    });

    function saveProfile(photoData) {
        try {
            const editCnic = document.getElementById("editCnic")?.value.trim();
            const name = document.getElementById("name")?.value.trim();
            const fatherName = document.getElementById("fatherName")?.value.trim();
            const cnic = document.getElementById("cnic")?.value.trim();
            const fatherCnic = document.getElementById("fatherCnic")?.value.trim();
            const bloodGroup = document.getElementById("bloodGroup")?.value;
            const phone = document.getElementById("phone")?.value.trim();
            const address = document.getElementById("address")?.value.trim();
            const dob = document.getElementById("dob")?.value;
            const gender = document.getElementById("gender")?.value;
            const married = document.querySelector('input[name="married"]:checked')?.value || "";
            const spouseCnic = document.getElementById("spouseCnic")?.value.trim();
            const spouseName = document.getElementById("spouseName")?.value.trim();
            const status = document.querySelector('input[name="status"]:checked')?.value;
            const deathDate = document.getElementById("deathDate")?.value;

            if (!name || !cnic || !status) {
                console.error("Required form fields missing");
                alert("Please fill all required fields!");
                return;
            }

            if (!editCnic && profiles.some(p => p.cnic === cnic)) {
                showDuplicateAlert("This CNIC already exists!");
                return;
            }

            const profileData = { name, fatherName, cnic, fatherCNIC: fatherCnic, bloodGroup, phone, address, dob, gender, married, spouseCnic, spouseName, status, deathDate, photo: photoData };

            if (!editCnic) {
                profiles.push(profileData);
            } else {
                const index = profiles.findIndex(p => p.cnic === editCnic);
                if (index !== -1) profiles[index] = profileData;
            }

            saveProfiles();
            closeForm();
            renderTree();
        } catch (e) {
            console.error("Error saving profile:", e);
            alert("Error saving profile: " + e.message);
        }
    }

    // Married Section logic
    document.getElementById("gender")?.addEventListener("change", function () {
        try {
            document.getElementById("marriedSection").style.display = this.value === "female" ? "block" : "none";
        } catch (e) {
            console.error("Error in gender change handler:", e);
        }
    });

    document.addEventListener("change", function (e) {
        try {
            if (e.target.name === "married") {
                document.getElementById("spouseCnic").style.display = e.target.value === "married" ? "block" : "none";
                document.getElementById("spouseName").style.display = e.target.value === "married" ? "block" : "none";
            }
        } catch (e) {
            console.error("Error in married status change handler:", e);
        }
    });

    // Auto-fill Spouse Name
    document.getElementById("spouseCnic")?.addEventListener("input", function () {
        try {
            const sCnic = this.value.trim();
            const spouse = profiles.find(p => p.cnic === sCnic);
            document.getElementById("spouseName").value = spouse ? spouse.name : "";
        } catch (e) {
            console.error("Error in spouse CNIC input handler:", e);
        }
    });

    // Auto-fill Father Name
    document.getElementById("fatherCnic")?.addEventListener("input", function () {
        try {
            const fCnic = this.value.trim();
            const father = profiles.find(p => p.cnic === fCnic);
            document.getElementById("fatherName").value = father ? father.name : "";
        } catch (e) {
            console.error("Error in father CNIC input handler:", e);
        }
    });

    // Show/Hide Death Date
    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.addEventListener("change", function () {
            try {
                const deathDateInput = document.getElementById("deathDate");
                deathDateInput.style.display = this.value === "deceased" ? "block" : "none";
                if (this.value === "alive") deathDateInput.value = "";
            } catch (e) {
                console.error("Error in status change handler:", e);
            }
        });
    });

    // Search with Blood Group filter
    document.getElementById("searchBox")?.addEventListener("input", debounce(function () {
        try {
            const q = this.value.toLowerCase().trim();
            const resultsBox = document.getElementById("searchResults");
            if (!q) {
                resultsBox.style.display = "none";
                resultsBox.innerHTML = "";
                return;
            }

            const bloodGroups = ["o+", "o-", "a+", "a-", "b+", "b-", "ab+", "ab-"];
            const maxResults = 50;
            let results;

            if (bloodGroups.includes(q)) {
                results = profiles.filter(p => p.status === "alive" && p.bloodGroup.toLowerCase() === q);
            } else {
                results = profiles.filter(p =>
                    (p.name && p.name.toLowerCase().includes(q)) ||
                    (p.cnic && p.cnic.toLowerCase().includes(q)) ||
                    (p.fatherName && p.fatherName.toLowerCase().includes(q))
                );
            }

            let html = results.slice(0, maxResults).map(r => `
                <p onclick="showProfile('${r.cnic}');document.getElementById('searchBox').value='';document.getElementById('searchResults').style.display='none';">
                    ${r.name} - ${r.cnic} (${r.bloodGroup})
                </p>
            `).join("");

            resultsBox.innerHTML = html || "<p style='padding:8px;'>کوئی نتیجہ نہیں ملا</p>";
            resultsBox.style.display = "block";
        } catch (e) {
            console.error("Error in search handler:", e);
            alert("Error in search: " + e.message);
        }
    }, 300));

    // Root Profile update
    try {
        const rootProfile = profiles.find(p => p.cnic === "ROOT001");
        if (rootProfile) {
            rootProfile.note = "یہ حضرت علیؓ کے بیٹے حضرت عباسؓ کے شجرہ سے ہیں";
            rootProfile.status = "deceased";
            rootProfile.deathDate = "1950-01-01";
            saveProfiles();
        } else {
            console.warn("Root profile not found, adding default root");
            profiles.unshift({
                name: "Hazrat Sultan Abulkhair Shah",
                fatherName: "",
                cnic: "ROOT001",
                fatherCNIC: "",
                bloodGroup: "O+",
                phone: "",
                address: "",
                dob: "",
                gender: "male",
                status: "deceased",
                deathDate: "1950-01-01",
                note: "یہ حضرت علیؓ کے بیٹے حضرت عباسؓ کے شجرہ سے ہیں",
                photo: ""
            });
            saveProfiles();
        }
    } catch (e) {
        console.error("Error updating root profile:", e);
    }

    // Tree Rendering with Photo
    function renderTree() {
        try {
            console.log(`Rendering tree with ${profiles.length} profiles`);
            const container = document.getElementById("treeContainer");
            if (!container) {
                console.error("Tree container not found");
                alert("Tree container not found!");
                return;
            }
            if (!profiles || profiles.length === 0) {
                console.error("No profiles found for rendering");
                container.innerHTML = "<p>No profiles available to display.</p>";
                return;
            }
            const rootProfile = profiles.find(p => p.cnic === "ROOT001") || profiles[0];
            if (!rootProfile) {
                console.error("No valid root profile found");
                container.innerHTML = "<p>Error: No valid root profile found.</p>";
                return;
            }
            container.innerHTML = `
                <div class="tree">
                    <ul>
                        <li>
                            <div class="node root-node" data-cnic="${rootProfile.cnic}">
                                ${rootProfile.photo ? `<img src="${rootProfile.photo}" style="width:40px;height:40px;border-radius:50%;"><br>` : ""}
                                ${rootProfile.name}
                            </div>
                            <ul id="children-${rootProfile.cnic}">${buildTree(rootProfile.cnic)}</ul>
                        </li>
                    </ul>
                </div>
            `;
            updateVoteSummary();
            console.log("Tree rendered successfully");
        } catch (e) {
            console.error("Error rendering tree:", e);
            alert("Error rendering family tree: " + e.message);
        }
    }

    function buildTree(parentCnic, page = 1, pageSize = 10) {
        try {
            console.log("Building tree for parent CNIC:", parentCnic);
            const children = profiles.filter(p => p.fatherCNIC === parentCnic);
            const start = (page - 1) * pageSize;
            const paginatedChildren = children.slice(start, start + pageSize);
            let html = `<ul>`;
            paginatedChildren.forEach(child => {
                const photoHTML = child.photo ? `<img src="${child.photo}" class="profile-photo">` : "";
                html += `
                <li>
                    <div class="node" data-cnic="${child.cnic}">
                        ${photoHTML}
                        ${child.name}
                        <div class="node-actions">
                            <button class="add-btn" onclick="openForm('${child.cnic}')">+</button>
                            <button class="edit-btn" data-action="view" data-cnic="${child.cnic}">View</button>
                            ${currentUser === "cpabk" ? `
                                <button class="edit-btn" data-action="edit" data-cnic="${child.cnic}">Edit</button>
                                <button class="delete-btn" data-action="delete" data-cnic="${child.cnic}">Delete</button>
                            ` : ""}
                            <button class="delete-btn" data-action="subtree" data-cnic="${child.cnic}">Tree</button>
                        </div>
                    </div>
                    <ul id="children-${child.cnic}">${buildTree(child.cnic)}</ul>
                </li>`;
            });
            if (children.length > start + pageSize) {
                html += `<li><button class="load-more-btn" onclick="loadMoreChildren('${parentCnic}', ${page + 1}, ${pageSize})">مزید لوڈ کریں</button></li>`;
            }
            html += `</ul>`;
            console.log("Tree built for CNIC:", parentCnic);
            return html;
        } catch (e) {
            console.error("Error building tree:", e);
            return "";
        }
    }

    function loadMoreChildren(parentCnic, page, pageSize) {
        try {
            const container = document.getElementById(`children-${parentCnic}`);
            if (container) {
                container.innerHTML = buildTree(parentCnic, page, pageSize);
            }
        } catch (e) {
            console.error("Error loading more children:", e);
        }
    }

    // Event Delegation for Node Actions
    document.addEventListener("click", function (e) {
        try {
            const action = e.target.dataset.action;
            const cnic = e.target.dataset.cnic;
            if (!action || !cnic) return;

            if (action === "view") showProfile(cnic);
            if (action === "edit" && currentUser === "cpabk") editProfile(cnic);
            if (action === "delete" && currentUser === "cpabk") deleteProfile(cnic);
            if (action === "subtree") showSubTree(cnic);
        } catch (e) {
            console.error("Error in node action handler:", e);
            alert("Error handling action: " + e.message);
        }
    });

    // SubTree Modal
    function showSubTree(cnic) {
        try {
            const person = profiles.find(p => p.cnic === cnic);
            if (!person) {
                console.error("Profile not found for subtree:", cnic);
                alert("Profile not found for subtree!");
                return;
            }
            const subtreeHTML = `
                <div class="tree">
                    <ul>
                        <li>
                            <div class="node root-node" data-cnic="${person.cnic}">
                                ${person.photo ? `<img src="${person.photo}" style="width:40px;height:40px;border-radius:50%;"><br>` : ""}
                                ${person.name}
                            </div>
                            <ul id="children-${person.cnic}">${buildTree(person.cnic)}</ul>
                        </li>
                    </ul>
                </div>
            `;
            const subTreeContent = document.getElementById("subTreeContent");
            if (subTreeContent) {
                subTreeContent.innerHTML = `
                    <button class="close-btn" onclick="closeSubTreeModal()">×</button>
                    ${subtreeHTML}
                `;
                document.getElementById("subTreeModal").style.display = "flex";
            } else {
                console.error("Subtree modal content element not found");
                alert("Subtree modal content not found!");
            }
        } catch (e) {
            console.error("Error showing subtree:", e);
            alert("Error showing subtree: " + e.message);
        }
    }

    function closeSubTreeModal() {
        try {
            const modal = document.getElementById("subTreeModal");
            if (modal) modal.style.display = "none";
        } catch (e) {
            console.error("Error closing subtree modal:", e);
        }
    }

    // Edit Profile
    function editProfile(cnic) {
        try {
            const person = profiles.find(p => p.cnic === cnic);
            if (!person) {
                alert("Profile not found!");
                return;
            }

            openForm();
            document.getElementById("formTitle").innerText = "Edit Profile";
            document.getElementById("editCnic").value = person.cnic;
            document.getElementById("name").value = person.name;
            document.getElementById("fatherName").value = person.fatherName;
            document.getElementById("cnic").value = person.cnic;
            document.getElementById("fatherCnic").value = person.fatherCNIC;
            document.getElementById("bloodGroup").value = person.bloodGroup;
            document.getElementById("phone").value = person.phone;
            document.getElementById("address").value = person.address;
            document.getElementById("dob").value = person.dob;
            document.getElementById("gender").value = person.gender;

            if (person.gender === "female") document.getElementById("marriedSection").style.display = "block";
            if (person.married === "married") {
                document.querySelector('input[name="married"][value="married"]').checked = true;
                document.getElementById("spouseCnic").style.display = "block";
                document.getElementById("spouseName").style.display = "block";
            } else {
                document.querySelector('input[name="married"][value="unmarried"]').checked = true;
            }
            document.getElementById("spouseCnic").value = person.spouseCnic || "";
            document.getElementById("spouseName").value = person.spouseName || "";
            document.querySelector(`input[name="status"][value="${person.status}"]`).checked = true;
            document.getElementById("deathDate").style.display = person.status === "deceased" ? "block" : "none";
            document.getElementById("deathDate").value = person.deathDate;
        } catch (e) {
            console.error("Error editing profile:", e);
            alert("Error editing profile: " + e.message);
        }
    }

    // Delete Profile
    function deleteProfile(cnic) {
        try {
            if (!confirm("Are you sure you want to delete this profile and all its children?")) return;
            function removeBranch(cnic) {
                const children = profiles.filter(p => p.fatherCNIC === cnic);
                children.forEach(child => removeBranch(child.cnic));
                profiles = profiles.filter(p => p.cnic !== cnic);
            }
            removeBranch(cnic);
            saveProfiles();
            renderTree();
        } catch (e) {
            console.error("Error deleting profile:", e);
            alert("Error deleting profile: " + e.message);
        }
    }

    // Generate and Store Random Code
    function getStoredRandomCode() {
        try {
            let randomCode = localStorage.getItem("randomCode");
            if (!randomCode) {
                randomCode = Math.floor(100000 + Math.random() * 900000);
                localStorage.setItem("randomCode", randomCode);
            }
            return parseInt(randomCode);
        } catch (e) {
            console.error("Error generating random code:", e);
            return 0;
        }
    }

    // Parse d/m/y Date to JavaScript Date
    function parseDMYDate(dateStr) {
        try {
            if (!dateStr || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) return null;
            const [day, month, year] = dateStr.split("/").map(Number);
            return new Date(year, month - 1, day);
        } catch (e) {
            console.error("Error parsing date:", e);
            return null;
        }
    }

    // Format Date as d/m/y with Full Year
    function formatDMYDate(date) {
        try {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            console.error("Error formatting date:", e);
            return "";
        }
    }

    // Get Month Range
    function getMonthRange(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        return {
            start: formatDMYDate(firstDay),
            end: formatDMYDate(lastDay)
        };
    }

    // Populate Month Selector
    function populateMonthSelector() {
        try {
            const selector = document.getElementById("monthSelector");
            if (!selector) return;

            const months = [];
            const today = new Date();
            const earliestYear = 2025;
            for (let year = earliestYear; year <= today.getFullYear(); year++) {
                for (let month = 0; month < 12; month++) {
                    const key = getFundsKey("fundsReceived", new Date(year, month, 1));
                    if (localStorage.getItem(key)) {
                        months.push({ year, month });
                    }
                }
            }
            const currentKey = getFundsKey("fundsReceived", today);
            if (!months.some(m => getFundsKey("fundsReceived", new Date(m.year, m.month, 1)) === currentKey)) {
                months.push({ year: today.getFullYear(), month: today.getMonth() });
            }

            months.sort((a, b) => new Date(b.year, b.month) - new Date(a.year, a.month));

            selector.innerHTML = months.map(m => {
                const date = new Date(m.year, m.month, 1);
                const monthName = date.toLocaleString('default', { month: 'long' });
                return `<option value="${m.year}-${m.month}">${monthName} ${m.year}</option>`;
            }).join("");
        } catch (e) {
            console.error("Error populating month selector:", e);
        }
    }

    // Check Plan Status
    function checkPlanStatus() {
        try {
            const forceLockForTesting = false;
            if (forceLockForTesting) {
                showLockModal();
                return;
            }

            const lastUnlockDate = localStorage.getItem("lastUnlockDate");
            const today = new Date();

            if (!lastUnlockDate) {
                localStorage.setItem("lastUnlockDate", formatDMYDate(today));
                localStorage.setItem("randomCode", Math.floor(100000 + Math.random() * 900000));
                return;
            }

            const lastDate = parseDMYDate(lastUnlockDate);
            if (!lastDate) {
                localStorage.setItem("lastUnlockDate", formatDMYDate(today));
                localStorage.setItem("randomCode", Math.floor(100000 + Math.random() * 900000));
                return;
            }

            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays >= 30) {
                showLockModal();
            }
        } catch (e) {
            console.error("Error checking plan status:", e);
            alert("Error checking plan status: " + e.message);
        }
    }

    // Show Lock Modal
    function showLockModal() {
        try {
            const randomCode = getStoredRandomCode();
            const correctCode = randomCode * 2 + 985973;

            const lockModal = document.createElement("div");
            lockModal.id = "lockModal";
            lockModal.style.cssText = `
                position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);
                display:flex;justify-content:center;align-items:center;z-index:9999;font-family:Arial;
            `;

            lockModal.innerHTML = `
                <div style="background:#fff;padding:20px;border-radius:10px;width:90%;max-width:360px;text-align:center;">
                    <h3 style="color:#d62828;margin-bottom:10px;">⚠ پلان ختم ہوگیا</h3>
                    <p style="color:#333;">ان لاک کرنے کے لیے دیے گئے وٹس آیپ پہ رابطہ کریں۔ To unlock, contact the given WhatsApp number. Send the provided code to the number mentioned below.:</p>
                    <p style="font-size:22px;font-weight:bold;color:#0a9396;margin:15px 0;">${randomCode}</p>
                    <p style="margin-bottom:10px;color:#d62828;">Correct Code: ${correctCode}</p>
                    <input type="text" id="unlockInput" placeholder="Enter Unlock Code" 
                        style="width:100%;padding:10px;margin-top:10px;border:1px solid #ccc;border-radius:6px;font-size:16px;">
                    <button id="unlockBtn" 
                        style="margin-top:15px;padding:10px 18px;background:#0a9396;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:16px;">
                        Unlock
                    </button>
                    <p style="margin-top:12px;font-size:14px;">Contact for Unlock: 
                        <a href="https://wa.me/923117323373" target="_blank" style="color:#d62828;text-decoration:none;font-weight:bold;">
                            WhatsApp 03117323373
                        </a>
                    </p>
                </div>
            `;

            document.body.appendChild(lockModal);

            document.getElementById("unlockBtn").addEventListener("click", function () {
                try {
                    const userCode = document.getElementById("unlockInput").value.trim();

                    if (parseInt(userCode) === correctCode || currentUser === "cpabk") {
                        localStorage.setItem("lastUnlockDate", formatDMYDate(new Date()));
                        localStorage.removeItem("randomCode");
                        document.body.removeChild(lockModal);
                        alert("✅ App Unlocked Successfully!");
                        location.reload();
                    } else {
                        alert("❌ غلط Code! دوبارہ کوشش کریں۔");
                    }
                } catch (e) {
                    console.error("Error in unlock button handler:", e);
                    alert("Error unlocking app: " + e.message);
                }
            });
        } catch (e) {
            console.error("Error showing lock modal:", e);
            alert("Error showing lock modal: " + e.message);
        }
    }

    // Funds Rendering
    function renderFunds() {
        try {
            const today = new Date();
            const lastUpdate = localStorage.getItem("lastFundUpdate");

            // Update currentMonth based on selector
            const selector = document.getElementById("monthSelector");
            if (selector && selector.value) {
                const [year, month] = selector.value.split("-").map(Number);
                currentMonth = new Date(year, month, 1);
            } else {
                currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            }

            // Load funds and balance for the selected month
            fundsReceived = JSON.parse(localStorage.getItem(getFundsKey("fundsReceived", currentMonth))) || [];
            fundsUsed = JSON.parse(localStorage.getItem(getFundsKey("fundsUsed", currentMonth))) || [];
            currentBalance = parseFloat(localStorage.getItem(getBalanceKey(currentMonth))) || 0;

            // Check if we need to transfer balance from previous month
            if (lastUpdate && currentMonth.getTime() === new Date(today.getFullYear(), today.getMonth(), 1).getTime()) {
                const lastDate = new Date(lastUpdate);
                if (today.getMonth() !== lastDate.getMonth() || today.getFullYear() !== lastDate.getFullYear()) {
                    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const prevBalance = parseFloat(localStorage.getItem(getBalanceKey(prevMonth))) || 0;
                    const prevFundsReceived = JSON.parse(localStorage.getItem(getFundsKey("fundsReceived", prevMonth))) || [];
                    const prevFundsUsed = JSON.parse(localStorage.getItem(getFundsKey("fundsUsed", prevMonth))) || [];
                    const lastMonthBalance = prevBalance + calculateCurrentBalance(prevFundsReceived, prevFundsUsed);
                    currentBalance = lastMonthBalance > 0 ? lastMonthBalance : 0;
                    fundsReceived = [];
                    fundsUsed = [];
                    saveFunds();
                }
            }
            localStorage.setItem("lastFundUpdate", today.toISOString());

            // Update date range header
            const dateRangeHeader = document.getElementById("dateRangeHeader");
            if (dateRangeHeader) {
                const range = getMonthRange(currentMonth);
                dateRangeHeader.textContent = `Report Period: ${range.start} to ${range.end}`;
            }

            // Render funds received table
            const receiveBody = document.getElementById("fundReceiveBody");
            if (receiveBody) {
                receiveBody.innerHTML = "";
                fundsReceived.forEach(fund => {
                    const row = document.createElement("tr");
                    row.style.cssText = "border: 1px solid #ccc;";
                    row.innerHTML = `
                        <td style="padding: 8px; border: 1px solid #ccc;">${fund.name}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${fund.amount}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${fund.accountNumber || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${fund.method || '-'}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${fund.date}</td>
                    `;
                    receiveBody.appendChild(row);
                });
            }

            // Render funds used table
            const useBody = document.getElementById("fundUseBody");
            if (useBody) {
                useBody.innerHTML = "";
                fundsUsed.forEach(fund => {
                    const row = document.createElement("tr");
                    row.style.cssText = "border: 1px solid #ccc;";
                    row.innerHTML = `
                        <td style="padding: 8px; border: 1px solid #ccc;">${fund.purpose}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${fund.amount}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${fund.date}</td>
                    `;
                    useBody.appendChild(row);
                });
            }

            updateFundTotals();
            populateMonthSelector();
        } catch (e) {
            console.error("Error rendering funds:", e);
            alert("Error rendering funds: " + e.message);
        }
    }

    // Update Fund Totals
    function updateFundTotals() {
        try {
            const totalReceived = fundsReceived.reduce((sum, fund) => sum + parseFloat(fund.amount), 0);
            const totalUsed = fundsUsed.reduce((sum, fund) => sum + parseFloat(fund.amount), 0);

            document.getElementById("totalReceived").textContent = totalReceived.toFixed(2);
            document.getElementById("totalUsed").textContent = totalUsed.toFixed(2);
            document.getElementById("currentBalance").textContent = (currentBalance + totalReceived - totalUsed).toFixed(2);
        } catch (e) {
            console.error("Error updating fund totals:", e);
        }
    }

    // Calculate Current Balance for a specific month
    function calculateCurrentBalance(received = fundsReceived, used = fundsUsed) {
        try {
            const totalReceived = received.reduce((sum, fund) => sum + parseFloat(fund.amount), 0);
            const totalUsed = used.reduce((sum, fund) => sum + parseFloat(fund.amount), 0);
            return totalReceived - totalUsed;
        } catch (e) {
            console.error("Error calculating current balance:", e);
            return 0;
        }
    }

    // Handle Fund Receive Form
    document.getElementById("fundReceiveForm")?.addEventListener("submit", function (e) {
        try {
            e.preventDefault();
            const name = document.getElementById("fundName").value.trim();
            const amount = parseFloat(document.getElementById("fundAmount").value);
            const accountNumber = document.getElementById("accountNumber").value.trim();
            const method = document.getElementById("paymentMethod").value;
            const date = formatDMYDate(new Date());

            if (!name || !amount || !accountNumber || !method) {
                alert("Please fill all required fields!");
                return;
            }

            fundsReceived.push({ name, amount, accountNumber, method, date });
            saveFunds();
            renderFunds();
            this.reset();
        } catch (e) {
            console.error("Error submitting fund receive form:", e);
            alert("Error saving fund: " + e.message);
        }
    });

    // Handle Fund Use Form
    document.getElementById("fundUseForm")?.addEventListener("submit", function (e) {
        try {
            e.preventDefault();
            const purpose = document.getElementById("fundPurpose").value.trim();
            const amount = parseFloat(document.getElementById("fundUsed").value);
            const date = formatDMYDate(new Date());

            if (!purpose || !amount) {
                alert("Please fill all required fields!");
                return;
            }

            const availableBalance = currentBalance + calculateCurrentBalance();
            if (amount > availableBalance) {
                alert("Insufficient funds!");
                return;
            }

            fundsUsed.push({ purpose, amount, date });
            saveFunds();
            renderFunds();
            this.reset();
        } catch (e) {
            console.error("Error submitting fund use form:", e);
            alert("Error using fund: " + e.message);
        }
    });

    // Export Fund Receive Table to PDF
    function exportFundReceivePDF() {
        try {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                throw new Error("jsPDF library not loaded");
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFont("helvetica", "normal");

            doc.setFontSize(16);
            doc.text("Received Funds Report", 14, 20);
            doc.setFontSize(12);
            const range = getMonthRange(currentMonth);
            doc.text(`Period: ${range.start} to ${range.end}`, 14, 30);

            const headers = ["Name", "Fund Amount", "Account Number", "Payment Method", "Date"];
            const data = fundsReceived.map(fund => [
                fund.name,
                fund.amount.toString(),
                fund.accountNumber || '-',
                fund.method || '-',
                fund.date
            ]);

            if (typeof doc.autoTable === "function") {
                doc.autoTable({
                    startY: 40,
                    head: [headers],
                    body: data,
                    theme: 'grid',
                    headStyles: { fillColor: [0, 95, 115], textColor: [255, 255, 255] },
                    styles: { textColor: [51, 51, 51], lineColor: [204, 204, 204], lineWidth: 0.1 },
                });

                const totalReceived = fundsReceived.reduce((sum, fund) => sum + parseFloat(fund.amount), 0);
                doc.text(`Total Received: ${totalReceived.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
            } else {
                throw new Error("autoTable plugin not loaded");
            }

            doc.save(`Fund_Receive_Report_${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}.pdf`);
        } catch (e) {
            console.error("Error exporting fund receive PDF:", e);
            alert("Error exporting PDF: " + e.message);
        }
    }

    // Export Fund Use Table to PDF
    function exportFundUsePDF() {
        try {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                throw new Error("jsPDF library not loaded");
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.setFont("helvetica", "normal");

            doc.setFontSize(16);
            doc.text("Used Funds Report", 14, 20);
            doc.setFontSize(12);
            const range = getMonthRange(currentMonth);
            doc.text(`Period: ${range.start} to ${range.end}`, 14, 30);

            const headers = ["Purpose", "Amount", "Date"];
            const data = fundsUsed.map(fund => [
                fund.purpose,
                fund.amount.toString(),
                fund.date
            ]);

            if (typeof doc.autoTable === "function") {
                doc.autoTable({
                    startY: 40,
                    head: [headers],
                    body: data,
                    theme: 'grid',
                    headStyles: { fillColor: [255, 140, 102], textColor: [255, 255, 255] },
                    styles: { textColor: [51, 51, 51], lineColor: [204, 204, 204], lineWidth: 0.1 },
                });

                const totalUsed = fundsUsed.reduce((sum, fund) => sum + parseFloat(fund.amount), 0);
                doc.text(`Total Used: ${totalUsed.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
                doc.text(`Current Balance: ${(currentBalance + calculateCurrentBalance()).toFixed(2)}`, 14, doc.lastAutoTable.finalY + 20);
            } else {
                throw new Error("autoTable plugin not loaded");
            }

            doc.save(`Fund_Use_Report_${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}.pdf`);
        } catch (e) {
            console.error("Error exporting fund use PDF:", e);
            alert("Error exporting PDF: " + e.message);
        }
    }

    // Export as CSV
    function exportBackup() {
        try {
            if (!profiles || profiles.length === 0) {
                alert("No data to export!");
                return;
            }

            const headers = [
                "name", "fatherName", "cnic", "fatherCNIC", "bloodGroup", "phone",
                "address", "dob", "gender", "married", "spouseCnic", "spouseName", "status", "deathDate", "photo", "note"
            ];

            // Create CSV with BOM for UTF-8 to support Urdu characters
            let csv = "\uFEFF" + headers.join(",") + "\n";

            profiles.forEach(profile => {
                const row = headers.map(h => {
                    const value = profile[h] || "";
                    // Properly escape quotes and handle commas in values
                    return `"${value.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
                }).join(",");
                csv += row + "\n";
            });

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "ABK_Family_Backup.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            alert("Data exported successfully!");
        } catch (e) {
            console.error("Error exporting backup:", e);
            alert("Error exporting backup: " + e.message);
        }
    }

    // Import from CSV
    async function importBackup(event) {
        try {
            const fileInput = document.getElementById("importBackup");
            if (!fileInput) {
                console.error("Import file input not found in DOM");
                alert("Import file input not found! Please ensure the input element with id='importBackup' exists.");
                return;
            }

            const file = event.target.files[0];
            if (!file) {
                alert("No file selected! Please choose a CSV file.");
                return;
            }

            if (!file.name.endsWith(".csv")) {
                alert("Invalid file type! Please select a CSV file.");
                return;
            }

            const reader = new FileReader();
            reader.onload = async function (e) {
                try {
                    const text = e.target.result;
                    const lines = text.split("\n").map(line => line.trim()).filter(line => line);
                    if (lines.length < 1) {
                        alert("CSV file is empty!");
                        return;
                    }

                    // Remove BOM if present
                    const cleanText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
                    const cleanLines = cleanText.split("\n").map(line => line.trim()).filter(line => line);

                    const headers = cleanLines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.replace(/"/g, "").trim());
                    const expectedHeaders = [
                        "name", "fatherName", "cnic", "fatherCNIC", "bloodGroup", "phone",
                        "address", "dob", "gender", "married", "spouseCnic", "spouseName", "status", "deathDate", "photo", "note"
                    ];

                    // Validate headers
                    if (!headers.every((h, i) => h === expectedHeaders[i])) {
                        alert("Invalid CSV format! Expected headers: " + expectedHeaders.join(", "));
                        return;
                    }

                    const importedProfiles = [];
                    const duplicateProfiles = [];
                    const chunkSize = 100;

                    for (let i = 1; i < cleanLines.length; i += chunkSize) {
                        const chunk = cleanLines.slice(i, i + chunkSize);
                        for (const line of chunk) {
                            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, "").trim());
                            if (values.length !== headers.length) {
                                console.warn("Skipping malformed row:", line);
                                continue;
                            }

                            let obj = {};
                            headers.forEach((header, index) => {
                                obj[header] = values[index] || "";
                            });

                            // Validate required fields
                            if (!obj.cnic || !obj.name) {
                                console.warn("Skipping row with missing CNIC or name:", obj);
                                continue;
                            }

                            // Validate bloodGroup
                            const validBloodGroups = ["o+", "o-", "a+", "a-", "b+", "b-", "ab+", "ab-"];
                            if (obj.bloodGroup && !validBloodGroups.includes(obj.bloodGroup.toLowerCase())) {
                                obj.bloodGroup = "";
                            }

                            // Validate status
                            if (!["alive", "deceased"].includes(obj.status)) {
                                obj.status = "alive";
                            }

                            // Clear deathDate if status is alive
                            if (obj.status === "alive") {
                                obj.deathDate = "";
                            }

                            if (profiles.some(p => p.cnic === obj.cnic)) {
                                duplicateProfiles.push(obj);
                            } else {
                                importedProfiles.push(obj);
                            }
                        }
                        await new Promise(resolve => setTimeout(resolve, 0));
                    }

                    if (duplicateProfiles.length > 0) {
                        showDuplicateAlert(`${duplicateProfiles.length} ڈوپلیکیٹ CNIC ملے: ${duplicateProfiles.map(p => p.cnic).join(", ")}`);
                    }

                    if (importedProfiles.length > 0) {
                        profiles = [...profiles, ...importedProfiles];
                        saveProfiles();
                        renderTree();
                        alert(`${importedProfiles.length} نئے پروفائلز امپورٹ ہوئے!`);
                    } else {
                        alert("کوئی نئے پروفائلز امپورٹ نہیں ہوئے!");
                    }

                    // Reset the file input
                    fileInput.value = "";
                } catch (e) {
                    console.error("Error processing CSV:", e);
                    alert("Error processing CSV: " + e.message);
                }
            };

            reader.onerror = function () {
                console.error("Error reading file");
                alert("Error reading CSV file! Please ensure the file is accessible.");
            };
            reader.readAsText(file);
        } catch (e) {
            console.error("Error importing backup:", e);
            alert("Error importing backup: " + e.message);
        }
    }

    // DOM Content Loaded
    document.addEventListener("DOMContentLoaded", function () {
        try {
            checkPlanStatus();
            const loginBox = document.getElementById("loginBox");
            const app = document.getElementById("app");

            // Bind importBackup to file input
            const importInput = document.getElementById("importBackup");
            if (importInput) {
                importInput.addEventListener("change", importBackup);
            } else {
                console.warn("Import input element not found in DOM");
            }

            if (window.location.pathname.includes("funds.html")) {
                if (!currentUser) {
                    window.location.href = "index.html";
                    return;
                }
                if (app) {
                    app.style.display = "block";
                    renderFunds();
                }
            } else {
                if (currentUser) {
                    if (loginBox) loginBox.style.display = "none";
                    if (app) {
                        app.style.display = "block";
                        renderTree();
                    }
                } else {
                    if (loginBox) loginBox.style.display = "block";
                    if (app) app.style.display = "none";
                }
            }
            console.log("App initialized successfully with currentUser:", currentUser);
        } catch (e) {
            console.error("Error during DOMContentLoaded:", e);
            alert("Error initializing app: " + e.message);
        }
    });

    // Debounce Function
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
} catch (e) {
    console.error("Critical error in script initialization:", e);
    alert("Critical error loading app: " + e.message);
}
