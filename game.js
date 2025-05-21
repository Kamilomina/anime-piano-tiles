class AnimeGameTiles {
    constructor() {
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.startButton = document.getElementById('startButton');
        this.difficultySelect = document.getElementById('difficultySelect');
        this.currentSongElement = document.getElementById('currentSong');
        this.isPlaying = false;
        this.gameSpeed = 2;
        this.tiles = [];
        
        this.sounds = {
            hit: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'),
            miss: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'),
            perfect: new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
        };
        
        this.songs = [
            {
                name: "Unravel - Tokyo Ghoul",
                notes: [1,3,2,4,1,2,3,4,2,1,3,2,4,1,3,2,1,4,3,2],
                bpm: 120
            },
            {
                name: "A Cruel Angel's Thesis - Evangelion",
                notes: [2,4,1,3,2,1,4,3,1,2,4,3,1,2,4,1,3,2,4,1],
                bpm: 130
            },
            {
                name: "Blue Bird - Naruto",
                notes: [1,2,4,3,1,4,2,3,1,2,4,1,3,2,4,3,1,2,4,3],
                bpm: 140
            },
            {
                name: "Gurenge - Demon Slayer",
                notes: [1,3,2,4,1,3,2,4,1,2,3,4,2,1,3,4,2,1,3,4],
                bpm: 135
            },
            {
                name: "The Hero - One Punch Man",
                notes: [4,2,1,3,4,2,1,3,4,1,2,3,4,2,1,3,4,2,1,3],
                bpm: 150
            },
            {
                name: "Crossing Field - SAO",
                notes: [1,2,4,3,1,4,2,3,2,1,4,3,2,1,4,2,3,1,4,2],
                bpm: 145
            },
            {
                name: "INNOCENCE - SAO",
                notes: [2,1,3,4,2,1,3,4,1,2,3,4,1,2,4,3,1,2,4,3],
                bpm: 132
            },
            {
                name: "Overfly - SAO",
                notes: [1,3,2,4,1,3,2,1,4,2,3,1,4,2,3,1,4,2,1,3],
                bpm: 128
            },
            {
                name: "IGNITE - SAO II",
                notes: [4,2,1,3,4,2,1,4,3,2,1,4,3,2,1,4,2,3,1,4],
                bpm: 155
            },
            {
                name: "Resolution - SAO III",
                notes: [1,4,2,3,1,4,2,3,1,2,4,3,1,2,4,3,2,1,4,3],
                bpm: 140
            }
        ];
        
        this.currentSong = null;
        this.noteIndex = 0;
        this.combo = 0;
        
        document.body.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.gameBoard.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleTileClick(e.touches[0]);
        }, { passive: false });
        
        this.init();
        this.highScoreElement.textContent = this.highScore;
    }

    init() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.gameBoard.addEventListener('click', (e) => this.handleTileClick(e));
        this.difficultySelect.addEventListener('change', () => this.updateDifficulty());
    }

    updateDifficulty() {
        const difficulty = this.difficultySelect.value;
        switch(difficulty) {
            case 'facil':
                this.gameSpeed = 1.5;
                break;
            case 'normal':
                this.gameSpeed = 2;
                break;
            case 'dificil':
                this.gameSpeed = 3;
                break;
        }
    }

    startGame() {
        this.isPlaying = true;
        this.score = 0;
        this.combo = 0;
        this.scoreElement.textContent = this.score;
        this.currentSong = this.songs[Math.floor(Math.random() * this.songs.length)];
        this.currentSongElement.textContent = this.currentSong.name;
        this.noteIndex = 0;
        this.startButton.style.display = 'none';
        this.updateDifficulty();
        this.generateTiles();
    }

    generateTiles() {
        if (!this.isPlaying) return;

        if (this.noteIndex >= this.currentSong.notes.length) {
            this.gameOver(true);
            return;
        }

        const laneNumber = this.currentSong.notes[this.noteIndex];
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.left = ((laneNumber - 1) * 25) + '%';
        tile.style.top = '-120px';
        tile.dataset.lane = laneNumber;
        
        this.gameBoard.appendChild(tile);
        this.tiles.push(tile);
        
        this.moveTile(tile);
        this.noteIndex++;

        setTimeout(() => this.generateTiles(), 60000 / this.currentSong.bpm);
    }

    moveTile(tile) {
        let pos = -120;
        const movement = setInterval(() => {
            if (!this.isPlaying) {
                clearInterval(movement);
                return;
            }

            pos += this.gameSpeed;
            tile.style.top = pos + 'px';

            if (pos >= 500) {
                this.missedTile();
                tile.remove();
                clearInterval(movement);
            }
        }, 16);
    }

    handleTileClick(e) {
        if (!this.isPlaying) return;

        const touch = e.touches ? e.touches[0] : e;
        const element = document.elementFromPoint(touch.clientX, touch.clientY);

        if (element && element.classList.contains('tile')) {
            const tileRect = element.getBoundingClientRect();
            const boardRect = this.gameBoard.getBoundingClientRect();
            const relativePosition = (tileRect.top - boardRect.top) / boardRect.height;

            let points = 100;
            if (relativePosition >= 0.7 && relativePosition <= 0.9) {
                points = 150;
                this.showPerfect(touch.clientX, touch.clientY);
                this.sounds.perfect.play().catch(() => {});
            } else {
                this.sounds.hit.play().catch(() => {});
            }

            this.combo++;
            points *= (1 + this.combo * 0.1);
            this.score += Math.round(points);
            this.scoreElement.textContent = this.score;
            
            element.remove();
            this.tiles = this.tiles.filter(t => t !== element);
        }
    }

    showPerfect(x, y) {
        const perfect = document.createElement('div');
        perfect.className = 'perfect';
        perfect.textContent = '¡PERFECTO!';
        perfect.style.left = x + 'px';
        perfect.style.top = y + 'px';
        document.body.appendChild(perfect);
        
        setTimeout(() => perfect.remove(), 1000);
    }

    missedTile() {
        this.combo = 0;
        this.sounds.miss.play().catch(() => {});
        
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
    }

    gameOver(won) {
        this.isPlaying = false;
        this.tiles.forEach(tile => tile.remove());
        this.tiles = [];
        this.startButton.style.display = 'block';
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('highScore', this.highScore);
        }
        
        alert(won ? 
            `¡Completaste "${this.currentSong.name}"!\nPuntuación: ${this.score}` : 
            `¡Juego terminado!\nPuntuación final: ${this.score}`
        );
    }
}

window.addEventListener('load', () => {
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });

    new AnimeGameTiles();
});