class TeamRandomizer {
    constructor() {
        this.players = [];
        this.team1 = [];
        this.team2 = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromStorage();
        this.render();
    }

    bindEvents() {
        document.getElementById('addPlayerBtn').addEventListener('click', () => this.addPlayer());
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPlayer();
        });
        document.getElementById('randomTeamsBtn').addEventListener('click', () => this.randomTeams());
        document.getElementById('balancedTeamsBtn').addEventListener('click', () => this.balancedTeams());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
        document.getElementById('togglePlayersBtn').addEventListener('click', () => this.togglePlayersList());
    }

    addPlayer() {
        const nameInput = document.getElementById('playerName');
        const levelSelect = document.getElementById('playerLevel');

        const name = nameInput.value.trim();
        const level = parseInt(levelSelect.value);

        if (!name) {
            alert('Vui lòng nhập tên cầu thủ');
            return;
        }

        // Kiểm tra trùng tên
        if (this.players.some(player => player.name.toLowerCase() === name.toLowerCase())) {
            alert('Tên cầu thủ đã tồn tại');
            return;
        }

        const player = {
            id: Date.now(),
            name: name,
            level: level
        };

        this.players.push(player);
        this.saveToStorage();
        this.render();

        // Reset form
        nameInput.value = '';
        levelSelect.value = '1';
        nameInput.focus();
    }

    removePlayer(playerId) {
        this.players = this.players.filter(player => player.id !== playerId);
        this.team1 = this.team1.filter(player => player.id !== playerId);
        this.team2 = this.team2.filter(player => player.id !== playerId);
        this.saveToStorage();
        this.render();
    }

    editPlayer(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        // Tạo modal để sửa thông tin
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        modal.innerHTML = `
            <div class="edit-modal-content">
                <div class="edit-modal-header">
                    <h3>Sửa Thông Tin Cầu Thủ</h3>
                    <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="edit-modal-body">
                    <div class="edit-form">
                        <label>Tên cầu thủ:</label>
                        <input type="text" id="editPlayerName" value="${player.name}" required>
                        
                        <label>Trình độ:</label>
                        <select id="editPlayerLevel">
                            <option value="1" ${player.level === 1 ? 'selected' : ''}>Trình độ 1 (Yếu)</option>
                            <option value="2" ${player.level === 2 ? 'selected' : ''}>Trình độ 2 (Trung bình)</option>
                            <option value="3" ${player.level === 3 ? 'selected' : ''}>Trình độ 3 (Khá)</option>
                            <option value="4" ${player.level === 4 ? 'selected' : ''}>Trình độ 4 (Giỏi)</option>
                            <option value="5" ${player.level === 5 ? 'selected' : ''}>Trình độ 5 (Xuất sắc)</option>
                        </select>
                    </div>
                </div>
                <div class="edit-modal-footer">
                    <button class="cancel-btn" onclick="this.parentElement.parentElement.parentElement.remove()">Hủy</button>
                    <button class="save-btn" onclick="teamRandomizer.savePlayerEdit(${playerId})">Lưu</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.getElementById('editPlayerName').focus();
    }

    savePlayerEdit(playerId) {
        const nameInput = document.getElementById('editPlayerName');
        const levelSelect = document.getElementById('editPlayerLevel');

        const newName = nameInput.value.trim();
        const newLevel = parseInt(levelSelect.value);

        if (!newName) {
            alert('Vui lòng nhập tên cầu thủ');
            return;
        }

        // Kiểm tra trùng tên (trừ chính nó)
        if (this.players.some(player => player.id !== playerId && player.name.toLowerCase() === newName.toLowerCase())) {
            alert('Tên cầu thủ đã tồn tại');
            return;
        }

        // Cập nhật thông tin cầu thủ
        const playerIndex = this.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            this.players[playerIndex].name = newName;
            this.players[playerIndex].level = newLevel;
        }

        // Cập nhật trong các đội nếu có
        const team1Index = this.team1.findIndex(p => p.id === playerId);
        if (team1Index !== -1) {
            this.team1[team1Index].name = newName;
            this.team1[team1Index].level = newLevel;
        }

        const team2Index = this.team2.findIndex(p => p.id === playerId);
        if (team2Index !== -1) {
            this.team2[team2Index].name = newName;
            this.team2[team2Index].level = newLevel;
        }

        this.saveToStorage();
        this.render();

        // Đóng modal
        document.querySelector('.edit-modal').remove();
    }

    randomTeams() {
        if (this.players.length < 2) {
            alert('Cần ít nhất 2 cầu thủ để chia đội');
            return;
        }

        // Trộn mảng players
        const shuffled = [...this.players].sort(() => Math.random() - 0.5);

        this.team1 = [];
        this.team2 = [];

        // Chia đều vào 2 đội
        shuffled.forEach((player, index) => {
            if (index % 2 === 0) {
                this.team1.push(player);
            } else {
                this.team2.push(player);
            }
        });

        this.render();
    }

    balancedTeams() {
        if (this.players.length < 2) {
            alert('Cần ít nhất 2 cầu thủ để chia đội');
            return;
        }

        let bestTeam1 = [];
        let bestTeam2 = [];
        let bestDifference = Infinity;

        // Thử 1000 lần random để tìm cách chia cân bằng nhất
        for (let i = 0; i < 1000; i++) {
            const shuffled = [...this.players].sort(() => Math.random() - 0.5);
            const tempTeam1 = [];
            const tempTeam2 = [];

            // Chia đều vào 2 đội
            shuffled.forEach((player, index) => {
                if (index % 2 === 0) {
                    tempTeam1.push(player);
                } else {
                    tempTeam2.push(player);
                }
            });

            // Tính tổng level của mỗi đội
            const team1Total = tempTeam1.reduce((sum, p) => sum + p.level, 0);
            const team2Total = tempTeam2.reduce((sum, p) => sum + p.level, 0);
            const difference = Math.abs(team1Total - team2Total);

            // Nếu cách chia này cân bằng hơn thì lưu lại
            if (difference < bestDifference) {
                bestDifference = difference;
                bestTeam1 = [...tempTeam1];
                bestTeam2 = [...tempTeam2];
            }

            // Nếu đã tìm được cách chia hoàn hảo (chênh lệch = 0) thì dừng
            if (difference === 0) break;
        }

        this.team1 = bestTeam1;
        this.team2 = bestTeam2;
        this.render();
    }

    clearAll() {
        if (confirm('Bạn có chắc chắn muốn xóa tất cả cầu thủ?')) {
            this.players = [];
            this.team1 = [];
            this.team2 = [];
            this.saveToStorage();
            this.render();
        }
    }

    togglePlayersList() {
        const playersList = document.getElementById('playersList');

        if (playersList.classList.contains('show')) {
            playersList.classList.remove('show');
        } else {
            playersList.classList.add('show');
        }
    }

    getLevelText(level) {
        const levels = {
            1: 'Yếu',
            2: 'Trung bình',
            3: 'Khá',
            4: 'Giỏi',
            5: 'Xuất sắc'
        };
        return levels[level] || 'Không xác định';
    }

    calculateAverageLevel(players) {
        if (players.length === 0) return 0;
        const total = players.reduce((sum, player) => sum + player.level, 0);
        return (total / players.length).toFixed(1);
    }

    render() {
        this.renderPlayersList();
        this.renderTeams();
    }

    renderPlayersList() {
        const container = document.getElementById('playersList');

        if (this.players.length === 0) {
            container.innerHTML = '<p class="empty-team">Chưa có cầu thủ nào</p>';
            return;
        }

        container.innerHTML = this.players.map(player => `
            <div class="player-card">
                <div class="player-info">
                    <span class="player-name">${player.name}</span>
                    <span class="player-level">Trình độ: ${player.level} - ${this.getLevelText(player.level)}</span>
                </div>
                <div class="player-actions">
                    <span class="level-badge level-${player.level}">${player.level}</span>
                    <button class="edit-btn" onclick="teamRandomizer.editPlayer(${player.id})">Sửa</button>
                    <button class="remove-btn" onclick="teamRandomizer.removePlayer(${player.id})">Xóa</button>
                </div>
            </div>
        `).join('');
    }

    renderTeams() {
        this.renderTeam('team1', this.team1, 'A');
        this.renderTeam('team2', this.team2, 'B');
    }

    renderTeam(teamId, players, teamName) {
        const container = document.getElementById(`${teamId}Players`);
        const countElement = document.getElementById(`${teamId}Count`);
        const avgElement = document.getElementById(`${teamId}Avg`);

        // Cập nhật thống kê
        countElement.textContent = `${players.length} cầu thủ`;
        avgElement.textContent = `Trình độ TB: ${this.calculateAverageLevel(players)}`;

        if (players.length === 0) {
            container.innerHTML = '<div class="empty-team">Chưa có cầu thủ</div>';
            return;
        }

        container.innerHTML = players.map(player => `
            <div class="team-player">
                <span class="team-player-name">${player.name}</span>
                <span class="team-player-level level-${player.level}">${player.level}</span>
            </div>
        `).join('');
    }

    saveToStorage() {
        localStorage.setItem('randomBD_players', JSON.stringify(this.players));
        localStorage.setItem('randomBD_team1', JSON.stringify(this.team1));
        localStorage.setItem('randomBD_team2', JSON.stringify(this.team2));
    }

    loadFromStorage() {
        const savedPlayers = localStorage.getItem('randomBD_players');
        const savedTeam1 = localStorage.getItem('randomBD_team1');
        const savedTeam2 = localStorage.getItem('randomBD_team2');

        if (savedPlayers) {
            this.players = JSON.parse(savedPlayers);
        }
        if (savedTeam1) {
            this.team1 = JSON.parse(savedTeam1);
        }
        if (savedTeam2) {
            this.team2 = JSON.parse(savedTeam2);
        }
    }
}

// Khởi tạo ứng dụng
const teamRandomizer = new TeamRandomizer();

// Thêm một số cầu thủ mẫu nếu chưa có dữ liệu
if (teamRandomizer.players.length === 0) {
    const samplePlayers = [
        { name: 'Vương', level: 4 },
        { name: 'Thế', level: 3 },
        { name: 'Tiến', level: 4 },
        { name: 'Dũng Búi', level: 3 },
        { name: 'Duy Anh', level: 2 },
        { name: 'Tân', level: 4 },
        { name: 'Quốc', level: 3 },
        { name: 'Vinh', level: 2 },
        { name: 'Tuấn Tân', level: 2 },
        { name: 'Tuấn Anh', level: 4 },
        { name: 'Thuyết', level: 4 },
        { name: 'Việt', level: 3 },
        { name: 'Tiệp', level: 2 },
        { name: 'Long', level: 4 },
        { name: 'Tuấn Trường', level: 3 },
        { name: 'Minh', level: 4 },
        { name: 'Lưu', level: 3 },
        { name: 'Trần Huy', level: 2 },
        { name: 'Hùng', level: 2 },
        { name: 'Kiên', level: 4 }
    ];

    samplePlayers.forEach(player => {
        teamRandomizer.players.push({
            id: Date.now() + Math.random(),
            name: player.name,
            level: player.level
        });
    });

    teamRandomizer.saveToStorage();
    teamRandomizer.render();
}
