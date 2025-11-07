# Focus Blocker 🧠

Une extension Chrome pour rester concentré en bloquant les sites distrayants et gérer ton temps avec la technique Pomodoro.

## Fonctionnalités

### Timer Pomodoro
- Durées personnalisables (travail + pause)
- Fenêtre séparée qui reste visible
- Notifications à chaque fin de session
- Statistiques de productivité

### Blocage de sites
- **Mode manuel** : Active/désactive quand tu veux
- **Mode Pomodoro** : Blocage automatique pendant le travail
- Sites bloqués par défaut : YouTube, TikTok, Facebook

### Interface moderne
- Design élégant avec dégradés violet/mauve
- Logo personnalisé
- Page de blocage motivante
- Animations fluides

## Installation

### En développement
1. Clone ce repo
2. Ouvre Chrome et va sur `chrome://extensions/`
3. Active le "Mode développeur"
4. Clique sur "Charger l'extension non empaquetée"
5. Sélectionne le dossier `extension_chrome/focus-blocker`

### Depuis le Chrome Web Store
*(Bientôt disponible)*

## Utilisation

### Mode Normal
1. Clique sur l'icône de l'extension
2. Clique sur "Activer le blocage"
3. Les sites distrayants sont maintenant bloqués
4. Clique à nouveau pour désactiver

### Mode Pomodoro
1. Ouvre l'extension
2. Configure tes durées (ex: 25 min travail, 5 min pause)
3. Clique sur "Lancer le Timer"
4. Une fenêtre s'ouvre avec le timer
5. Le blocage s'active automatiquement pendant le travail
6. Profite de ta pause (sites débloqués) ☕
7. Le cycle recommence automatiquement

## 🛠️ Personnalisation

Tu peux modifier les sites bloqués dans `background.js` :
```javascript
const blockedSites = ["youtube.com", "tiktok.com", "facebook.com"];
```

## 🔒 Confidentialité

Focus Blocker respecte ta vie privée :
- Toutes les données restent locales
- Aucune collecte d'informations
- Aucun tracking
- Open source

Voir [PRIVACY-POLICY.txt](PRIVACY-POLICY.txt) pour plus de détails.

## Technologies

- **Manifest V3** (dernière version Chrome)
- **Declarative Net Request** (blocage efficace)
- **Chrome Storage API** (sauvegarde locale)
- **Chrome Notifications API** (alertes Pomodoro)
- **Chrome Windows API** (fenêtre timer)

## Contribution

Les contributions sont les bienvenues ! N'hésite pas à :
- Signaler des bugs
- Proposer des fonctionnalités
- Soumettre des pull requests

## Contact

- Email : raphael.hoarau@epitech.eu
- GitHub : https://github.com/horaphael/FocusBlocker?tab=readme-ov-file

---

**Reste concentré, travaille mieux ! 🚀**
