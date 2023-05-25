module.exports = {
  install: function install(Vue, options = {}) {
    if (!options.disabled && (!options.key || options.key.length === 0)) {
      console.warn("Please enter a Zendesk Web Widget Key");
    }

    const disabledLogger = function(method, ...args) {
      console.log("Zendesk is disabled, you called:", { method, args });
    };

    if (options.disabled) {
      window.zE = disabledLogger;
    }

    window.zESettings = options.settings;

    const root = new Vue();

    let isLoaded = false;

    root.isLoaded = () => isLoaded;
    root.load = zendeskKey => {
      if (isLoaded) {
        return;
      }

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.id = "ze-snippet";
      const actualZendeskKey = zendeskKey || options.key;
      script.src =
        "https://static.zdassets.com/ekr/snippet.js?key=" + actualZendeskKey;

      if (options.nonce) {
        script.setAttribute('nonce', options.nonce)
      }

      delete window.zE;
      const first = document.getElementsByTagName("script")[0];
      first.parentNode.insertBefore(script, first);

      script.onload = event => {
        isLoaded = true;

        if (options.hideOnLoad) {
          root.hide();
        }

        root.$emit("loaded", event);

        window.zE("messenger:on", "open", () => {
          root.$emit("open")
        })

        window.zE("messenger:on", "close", () => {
          root.$emit("close")
        })

        window.zE("messenger:on", "unreadMessages", (count) => {
          root.$emit("unreadMessages", count)
        })
      };
    };

    if (!options.disabled) {
      root.load(options.key);
    }

    root.show = () => window.zE('messenger', 'open');
    root.close = () => window.zE('messenger', 'close');
    root.hide = () => window.zE('messenger', 'hide');
    root.show = () => window.zE('messenger', 'show');
    

    Object.defineProperty(root, "zE", {
      get: function get() {
        return window.zE;
      }
    });

    Vue.prototype.$zendesk = root;
  }
};
