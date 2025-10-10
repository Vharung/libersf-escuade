const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class EscuadePointsApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "liber-escuade-points",
    classes: ["liber-escuade"],
    window: {
      title: "Points d’Escouade",
    },
    popOut: false, // Toujours affiché sur la table
    template: "modules/libersf-escuade/templates/hub.hbs",
    position: { top: 60, left: 100, width: 220, height: "auto" },
    actions: {
      pts: EscuadePointsApp.onPtsClick
    }
  };

  static PARTS = {
    main: {
      template: "modules/libersf-escuade/templates/hub.hbs",
    },
  };

  /** @returns {number} les points d’escouade actuels */
  get points() {
    return game.settings.get("libersf", "pointsEscouade") ?? 0;
  }

  async _prepareContext() {
    return { points: this.points };
  }

  /** @override */
  async _onRender(context, options) {
    await super._onRender(context, options);
  }

  /** Gère les clics sur les boutons +/- */
  static async onPtsClick(event, button) {
    event.preventDefault();

    const targetId = button.dataset.target;
    let newValue = this.points;

    if (targetId === "add") {
      newValue = Math.min(3, this.points + 1);
    } else {
      newValue = Math.max(0, this.points - 1);
    }

    await game.settings.set("libersf", "pointsEscouade", newValue);
    this.render();
    console.log(`Points d’escouade : ${newValue}`);
  }

}

// --- Initialisation ---
Hooks.once("init", () => {
  game.settings.register("libersf", "pointsEscouade", {
    name: "Points d’Escouade",
    scope: "world",
    config: false,
    type: Number,
    default: 3,
  });
});

// --- Chargement de l’interface ---
Hooks.once("ready", () => {
  const app = new EscuadePointsApp();
  app.render(true);
});
