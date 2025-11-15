const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class EscuadePointsApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "liber-escuade-points",
    classes: ["liber-escuade"],
    window: {
      title: "Points d'Escouade",
    },
    popOut: false,
    template: "modules/libersf-escuade/templates/hub.hbs",
    position: { top: 60, left: 100, width: 220, height: "auto" }
  };

  static PARTS = {
    main: {
      template: "modules/libersf-escuade/templates/hub.hbs",
    },
  };

  async _onRender(context, options) {
    await super._onRender(context, options);
    // Attacher les boutons +/- après rendu
    this.element.querySelectorAll("[data-action='pts']")
      .forEach(btn => {
        btn.addEventListener("click", this.onPtsClick.bind(this));
      });
  }

  /** Valeur actuelle */
  get points() {
    return game.settings.get("libersf", "pointsEscouade") ?? 0;
  }

  /** Valeur max */
  get maxpoints() {
    return game.settings.get("libersf", "pointsEscouadeMax") ?? 3;
  }

  /** Titre dynamique */
  get title() {
    return game.settings.get("libersf", "pointsEscouadeTitle") || "Points d'Escouade";
  }

  async _prepareContext() {
    return {
      points: this.points,
      maxpoints: this.maxpoints,
      title: this.title  // <-- Correction ici
    };
  }

  /** Mise à jour du titre de la fenêtre */
  _updateTitle() {
    const windowTitle = this.element.querySelector(".window-title");
    if (windowTitle) {
      windowTitle.textContent = this.title;
    }
  }

  /** Override de render pour mettre à jour le titre */
  async render(force = false, options = {}) {
    await super.render(force, options);
    this._updateTitle();
    return this;
  }

  /** Clic sur + ou - */
  async onPtsClick(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const targetId = button.dataset.target;
    let newValue = this.points;
    
    if (targetId === "add") {
      newValue = Math.min(this.maxpoints, this.points + 1);
    } else {
      newValue = Math.max(0, this.points - 1);
    }
    
    await game.settings.set("libersf", "pointsEscouade", newValue);
    this.render();
    console.log(`Points d'escouade : ${newValue}/${this.maxpoints}`);
  }
}

// --- Initialisation ---
Hooks.once("init", () => {
  game.settings.register("libersf", "pointsEscouade", {
    name: "Points d'Escouade",
    hint: "Valeur actuelle des points d'escouade.",
    scope: "world",
    config: true,
    type: Number,
    default: 3,
    onChange: value => {
      console.log("onChange pointsEscouade ->", value);
      ui.escuade?.render(true);
    }
  });

  game.settings.register("libersf", "pointsEscouadeMax", {
    name: "Points d'Escouade (max)",
    hint: "Valeur maximale affichée dans le widget.",
    scope: "world",
    config: true,
    type: Number,
    default: 3,
    onChange: value => {
      console.log("onChange pointsEscouadeMax ->", value);
      ui.escuade?.render(true);
    }
  });

  game.settings.register("libersf", "pointsEscouadeTitle", {
    name: "Nom de l'Escouade",
    hint: "Texte affiché dans le widget",
    scope: "world",
    config: true,
    type: String,
    default: "Points d'Escouade",
    onChange: value => {
      console.log("onChange pointsEscouadeTitle ->", value);
      ui.escuade?.render(true);
    }
  });
});

// --- Chargement ---
Hooks.once("ready", () => {
  ui.escuade = new EscuadePointsApp();
  ui.escuade.render(true);
});

Hooks.on("updateWorldSetting", (settingKey, settingValue) => {
  if (settingKey.startsWith("libersf.pointsEscouade")) {
    console.log("Changement détecté :", settingKey, settingValue);
    ui.escuade?.render(true);
  }
});