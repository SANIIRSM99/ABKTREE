try {
    let profiles = [];
    let currentUser = "";
    let currentMonth = new Date();
    let fundsReceived = [];
    let fundsUsed = [];
    let currentBalance = 0;

    const API_URL = 'https://github.com/SANIIRSM99/ABKTREE.git'; // Replace with your backend URL after deployment

    // Fetch Profiles from Backend
    async function fetchProfiles() {
        try {
            const response = await fetch(`${API_URL}/profiles`);
            profiles = await response.json();
            return profiles;
        } catch (e) {
            console.error("Failed to fetch profiles:", e);
            alert("Error fetching profiles. Check network or server status.");
            return [];
        }
    }

    // Save Profile to Backend
    async function saveProfileToBackend(profileData) {
        try {
            const response = await fetch(`${API_URL}/profiles`, {
                method: profileData.editCnic ? 'POST' : 'POST',
                headers: { 'Content-Type': 'application/json', 'x-user': currentUser },
                body: JSON.stringify(profileData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            return await response.json();
        } catch (e) {
            console.error("Error saving profile:", e);
            throw e;
        }
    }

    // Delete Profile from Backend
    async function deleteProfileFromBackend(cnic) {
        try {
            const response = await fetch(`${API_URL}/profiles/${cnic}`, {
                method: 'DELETE',
                headers: { 'x-user': currentUser }
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            return await response.json();
        } catch (e) {
            console.error("Error deleting profile:", e);
            throw e;
        }
    }

    // Fetch Funds from Backend
    async function fetchFunds(year, month) {
        try {
            const response = await fetch(`${API_URL}/funds/${year}/${month}`);
            const data = await response.json();
            fundsReceived = data.fundsReceived;
            fundsUsed = data.fundsUsed;
            currentBalance = calculateCurrentBalance();
        } catch (e) {
            console.error("Error fetching funds:", e);
            alert("Error fetching funds: " + e.message);
        }
    }

    // Save Funds to Backend
    async function saveFundReceived(fundData) {
        try {
            const response = await fetch(`${API_URL}/funds/received`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fundData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            return await response.json();
        } catch (e) {
            console.error("Error saving fund received:", e);
            throw e;
        }
    }

    async function saveFundUsed(fundData) {
        try {
            const response = await fetch(`${API_URL}/funds/used`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fundData)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }
            return await response.json();
        } catch (e) {
            console.error("Error saving fund used:", e);
            throw e;
        }
    }

    // Show Duplicate Alert
    function showDuplicateAlert(msg) {
        const alertBox = document.getElementById("duplicateAlert");
        if (alertBox) {
            alertBox.textContent = msg;
            alertBox.style.display = "block";
            setTimeout(() => (alertBox.style.display = "none"), 5000);
        } else {
            console.error("Duplicate alert box not found in DOM");
            alert("Duplicate alert box not found!");
        }
    }

    // LOGIN
    async function login() {
        try {
            const user = document.getElementById("username")?.value.trim();
            const pass = document.getElementById("password")?.value.trim();
            const errorBox = document.getElementById("loginError");

            if (!user || !pass || !errorBox) {
                console.error("Login inputs or error box not found");
                alert("Login form elements missing!");
                return;
            }

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });

            if (response.ok) {
                const data = await response.json();
                currentUser = data.user;
                localStorage.setItem("currentUser", currentUser);
                document.getElementById("loginBox").style.display = "none";
                document.getElementById("app").style.display = "block";
                if (window.location.pathname.includes("funds.html")) {
                    await renderFunds();
                } else {
                    await renderTree();
                }
            } else {
                const error = await response.json();
                errorBox.textContent = error.message;
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
    }

    function closeForm() {
        const formPanel = document.getElementById("formPanel");
        if (formPanel) formPanel.classList.remove("active");
    }

    // PROFILE MODAL
    function showProfile(cnic) {
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
    }

    function closeModal() {
        const modal = document.getElementById("profileModal");
        if (modal) modal.style.display = "none";
    }

    // Calculate Age
    function calculateAge(dob, deathDate = null) {
        if (!dob) return null;
        const birth = new Date(dob);
        const endDate = deathDate ? new Date(deathDate) : new Date();
        let age = endDate.getFullYear() - birth.getFullYear();
        const m = endDate.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && endDate.getDate() < birth.getDate())) age--;
        return age;
    }

    // Check Vote Eligibility
    function isEligibleForVote(profile) {
        if (profile.status === "deceased") return false;
        const age = calculateAge(profile.dob);
        return age !== null && age >= 18;
    }

    // Update Vote Summary
    function updateVoteSummary() {
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
        }
    }

    // SAVE PROFILE
    function getBase64(file, callback) {
        const reader = new FileReader();
        reader.onload = e => callback(e.target.result);
        reader.readAsDataURL(file);
    }

    document.getElementById("profileForm")?.addEventListener("submit", async function (e) {
        e.preventDefault();
        const photoFile = document.getElementById("profilePhoto")?.files[0];
        if (photoFile) {
            getBase64(photoFile, async base64Image => await saveProfile(base64Image));
        } else {
            await saveProfile("");
        }
    });

    async function saveProfile(photoData) {
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
                alert("Please fill all required fields!");
                return;
            }

            const profileData = { name, fatherName, cnic, fatherCNIC: fatherCnic, bloodGroup, phone, address, dob, gender, married, spouseCnic, spouseName, status, deathDate, photo: photoData, editCnic };

            await saveProfileToBackend(profileData);
            await fetchProfiles();
            closeForm();
            renderTree();
        } catch (e) {
            console.error("Error saving profile:", e);
            alert("Error saving profile: " + e.message);
        }
    }

    // Married Section logic
    document.getElementById("gender")?.addEventListener("change", function () {
        document.getElementById("marriedSection").style.display = this.value === "female" ? "block" : "none";
    });

    document.addEventListener("change", function (e) {
        if (e.target.name === "married") {
            document.getElementById("spouseCnic").style.display = e.target.value === "married" ? "block" : "none";
            document.getElementById("spouseName").style.display = e.target.value === "married" ? "block" : "none";
        }
    });

    // Auto-fill Spouse Name
    document.getElementById("spouseCnic")?.addEventListener("input", function () {
        const sCnic = this.value.trim();
        const spouse = profiles.find(p => p.cnic === sCnic);
        document.getElementById("spouseName").value = spouse ? spouse.name : "";
    });

    // Auto-fill Father Name
    document.getElementById("fatherCnic")?.addEventListener("input", function () {
        const fCnic = this.value.trim();
        const father = profiles.find(p => p.cnic === fCnic);
        document.getElementById("fatherName").value = father ? father.name : "";
    });

    // Show/Hide Death Date
    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.addEventListener("change", function () {
            const deathDateInput = document.getElementById("deathDate");
            deathDateInput.style.display = this.value === "deceased" ? "block" : "none";
            if (this.value === "alive") deathDateInput.value = "";
        });
    });

    // Search with Blood Group filter
    document.getElementById("searchBox")?.addEventListener("input", debounce(async function () {
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
    }, 300));

    // Tree Rendering with Photo
    async function renderTree() {
        try {
            console.log("Fetching profiles for tree rendering...");
            await fetchProfiles();
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
        return html;
    }

    function loadMoreChildren(parentCnic, page, pageSize) {
        const container = document.getElementById(`children-${parentCnic}`);
        if (container) {
            container.innerHTML = buildTree(parentCnic, page, pageSize);
        }
    }

    // Event Delegation for Node Actions
    document.addEventListener("click", async function (e) {
        const action = e.target.dataset.action;
        const cnic = e.target.dataset.cnic;
        if (!action || !cnic) return;

        if (action === "view") showProfile(cnic);
        if (action === "edit" && currentUser === "cpabk") editProfile(cnic);
        if (action === "delete" && currentUser === "cpabk") {
            if (confirm("Are you sure you want to delete this profile and all its children?")) {
                await deleteProfileFromBackend(cnic);
                await fetchProfiles();
                renderTree();
            }
        }
        if (action === "subtree") showSubTree(cnic);
    });

    // SubTree Modal
    function showSubTree(cnic) {
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
    }

    function closeSubTreeModal() {
        const modal = document.getElementById("subTreeModal");
        if (modal) modal.style.display = "none";
    }

    // Edit Profile
    function editProfile(cnic) {
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
    }

    // Parse d/m/y Date to JavaScript Date
    function parseDMYDate(dateStr) {
        if (!dateStr || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) return null;
        const [day, month, year] = dateStr.split("/").map(Number);
        return new Date(year, month - 1, day);
    }

    // Format Date as d/m/y with Full Year
    function formatDMYDate(date) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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
    async function populateMonthSelector() {
        const selector = document.getElementById("monthSelector");
        if (!selector) return;

        const months = [];
        const today = new Date();
        const earliestYear = 2025;
        for (let year = earliestYear; year <= today.getFullYear(); year++) {
            for (let month = 0; month < 12; month++) {
                const response = await fetch(`${API_URL}/funds/${year}/${month + 1}`);
                const data = await response.json();
                if (data.fundsReceived.length > 0 || data.fundsUsed.length > 0) {
                    months.push({ year, month });
                }
            }
        }
        months.push({ year: today.getFullYear(), month: today.getMonth() });

        months.sort((a, b) => new Date(b.year, b.month) - new Date(a.year, a.month));

        selector.innerHTML = months.map(m => {
            const date = new Date(m.year, m.month, 1);
            const monthName = date.toLocaleString('default', { month: 'long' });
            return `<option value="${m.year}-${m.month}">${monthName} ${m.year}</option>`;
        }).join("");
    }

    // Funds Rendering
    async function renderFunds() {
        try {
            const today = new Date();
            const selector = document.getElementById("monthSelector");
            if (selector && selector.value) {
                const [year, month] = selector.value.split("-").map(Number);
                currentMonth = new Date(year, month, 1);
            } else {
                currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            }

            await fetchFunds(currentMonth.getFullYear(), currentMonth.getMonth() + 1);

            const dateRangeHeader = document.getElementById("dateRangeHeader");
            if (dateRangeHeader) {
                const range = getMonthRange(currentMonth);
                dateRangeHeader.textContent = `Report Period: ${range.start} to ${range.end}`;
            }

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
                        <td style="padding: 8px; border: 1px solid #ccc;">${formatDMYDate(new Date(fund.date))}</td>
                    `;
                    receiveBody.appendChild(row);
                });
            }

            const useBody = document.getElementById("fundUseBody");
            if (useBody) {
                useBody.innerHTML = "";
                fundsUsed.forEach(fund => {
                    const row = document.createElement("tr");
                    row.style.cssText = "border: 1px solid #ccc;";
                    row.innerHTML = `
                        <td style="padding: 8px; border: 1px solid #ccc;">${fund.purpose}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${fund.amount}</td>
                        <td style="padding: 8px; border: 1px solid #ccc;">${formatDMYDate(new Date(fund.date))}</td>
                    `;
                    useBody.appendChild(row);
                });
            }

            updateFundTotals();
            await populateMonthSelector();
        } catch (e) {
            console.error("Error rendering funds:", e);
            alert("Error rendering funds: " + e.message);
        }
    }

    // Update Fund Totals
    function updateFundTotals() {
        const totalReceived = fundsReceived.reduce((sum, fund) => sum + parseFloat(fund.amount), 0);
        const totalUsed = fundsUsed.reduce((sum, fund) => sum + parseFloat(fund.amount), 0);

        document.getElementById("totalReceived").textContent = totalReceived.toFixed(2);
        document.getElementById("totalUsed").textContent = totalUsed.toFixed(2);
        document.getElementById("currentBalance").textContent = (totalReceived - totalUsed).toFixed(2);
    }

    // Calculate Current Balance
    function calculateCurrentBalance() {
        const totalReceived = fundsReceived.reduce((sum, fund) => sum + parseFloat(fund.amount), 0);
        const totalUsed = fundsUsed.reduce((sum, fund) => sum + parseFloat(fund.amount), 0);
        return totalReceived - totalUsed;
    }

    // Handle Fund Receive Form
    document.getElementById("fundReceiveForm")?.addEventListener("submit", async function (e) {
        e.preventDefault();
        const name = document.getElementById("fundName").value.trim();
        const amount = parseFloat(document.getElementById("fundAmount").value);
        const accountNumber = document.getElementById("accountNumber").value.trim();
        const method = document.getElementById("paymentMethod").value;
        const date = new Date();

        if (!name || !amount || !accountNumber || !method) {
            alert("Please fill all required fields!");
            return;
        }

        await saveFundReceived({ name, amount, accountNumber, method, date });
        await renderFunds();
        this.reset();
    });

    // Handle Fund Use Form
    document.getElementById("fundUseForm")?.addEventListener("submit", async function (e) {
        e.preventDefault();
        const purpose = document.getElementById("fundPurpose").value.trim();
        const amount = parseFloat(document.getElementById("fundUsed").value);
        const date = new Date();
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1;

        if (!purpose || !amount) {
            alert("Please fill all required fields!");
            return;
        }

        await saveFundUsed({ purpose, amount, date, year, month });
        await renderFunds();
        this.reset();
    });

    // Export Fund Receive Table to PDF
    function exportFundReceivePDF() {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert("jsPDF library not loaded");
            return;
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
            formatDMYDate(new Date(fund.date))
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
            alert("autoTable plugin not loaded");
            return;
        }

        doc.save(`Fund_Receive_Report_${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}.pdf`);
    }

    // Export Fund Use Table to PDF
    function exportFundUsePDF() {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert("jsPDF library not loaded");
            return;
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
            formatDMYDate(new Date(fund.date))
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
            doc.text(`Current Balance: ${calculateCurrentBalance().toFixed(2)}`, 14, doc.lastAutoTable.finalY + 20);
        } else {
            alert("autoTable plugin not loaded");
            return;
        }

        doc.save(`Fund_Use_Report_${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}.pdf`);
    }

    // Export as CSV
    async function exportBackup() {
        await fetchProfiles();
        if (!profiles || profiles.length === 0) {
            alert("No data to export!");
            return;
        }

        const headers = [
            "name", "fatherName", "cnic", "fatherCNIC", "bloodGroup", "phone",
            "address", "dob", "gender", "married", "spouseCnic", "spouseName", "status", "deathDate", "photo", "note"
        ];

        let csv = "\uFEFF" + headers.join(",") + "\n";
        profiles.forEach(profile => {
            const row = headers.map(h => {
                const value = profile[h] || "";
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
    }

    // Import from CSV
    async function importBackup(event) {
        const fileInput = document.getElementById("importBackup");
        if (!fileInput) {
            console.error("Import file input not found in DOM");
            alert("Import file input not found!");
            return;
        }

        const file = event.target.files[0];
        if (!file) {
            alert("No file selected!");
            return;
        }

        if (!file.name.endsWith(".csv")) {
            alert("Invalid file type! Please select a CSV file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
            const text = e.target.result;
            const lines = text.split("\n").map(line => line.trim()).filter(line => line);
            if (lines.length < 1) {
                alert("CSV file is empty!");
                return;
            }

            const cleanText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
            const cleanLines = cleanText.split("\n").map(line => line.trim()).filter(line => line);

            const headers = cleanLines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.replace(/"/g, "").trim());
            const expectedHeaders = [
                "name", "fatherName", "cnic", "fatherCNIC", "bloodGroup", "phone",
                "address", "dob", "gender", "married", "spouseCnic", "spouseName", "status", "deathDate", "photo", "note"
            ];

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

                    if (!obj.cnic || !obj.name) {
                        console.warn("Skipping row with missing CNIC or name:", obj);
                        continue;
                    }

                    const validBloodGroups = ["o+", "o-", "a+", "a-", "b+", "b-", "ab+", "ab-"];
                    if (obj.bloodGroup && !validBloodGroups.includes(obj.bloodGroup.toLowerCase())) {
                        obj.bloodGroup = "";
                    }

                    if (!["alive", "deceased"].includes(obj.status)) {
                        obj.status = "alive";
                    }

                    if (obj.status === "alive") {
                        obj.deathDate = "";
                    }

                    const response = await fetch(`${API_URL}/profiles`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-user': currentUser },
                        body: JSON.stringify(obj)
                    });

                    if (response.status === 400 && (await response.json()).message.includes("CNIC already exists")) {
                        duplicateProfiles.push(obj);
                    } else if (response.ok) {
                        importedProfiles.push(obj);
                    }
                }
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            if (duplicateProfiles.length > 0) {
                showDuplicateAlert(`${duplicateProfiles.length} ڈوپلیکیٹ CNIC ملے: ${duplicateProfiles.map(p => p.cnic).join(", ")}`);
            }

            if (importedProfiles.length > 0) {
                await fetchProfiles();
                renderTree();
                alert(`${importedProfiles.length} نئے پروفائلز امپورٹ ہوئے!`);
            } else {
                alert("کوئی نئے پروفائلز امپورٹ نہیں ہوئے!");
            }

            fileInput.value = "";
        };

        reader.onerror = function () {
            console.error("Error reading file");
            alert("Error reading CSV file!");
        };
        reader.readAsText(file);
    }

    // DOM Content Loaded
    document.addEventListener("DOMContentLoaded", async function () {
        try {
            currentUser = localStorage.getItem("currentUser") || "";
            const loginBox = document.getElementById("loginBox");
            const app = document.getElementById("app");

            const importInput = document.getElementById("importBackup");
            if (importInput) {
                importInput.addEventListener("change", importBackup);
            }

            if (window.location.pathname.includes("funds.html")) {
                if (!currentUser) {
                    window.location.href = "index.html";
                    return;
                }
                if (app) {
                    app.style.display = "block";
                    await renderFunds();
                }
            } else {
                if (currentUser) {
                    if (loginBox) loginBox.style.display = "none";
                    if (app) {
                        app.style.display = "block";
                        await renderTree();
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