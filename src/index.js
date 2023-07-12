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
    const type = options.type;
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
      script.src = "https://static.zdassets.com/ekr/snippet.js?key=" + actualZendeskKey;

      if (options.nonce) {
        script.setAttribute('nonce', options.nonce)
      }

      delete window.zE;
      const first = document.getElementsByTagName("script")[0];
      first.parentNode.insertBefore(script, first);

      script.onload = event => {
        isLoaded = true;

        if (options.hideOnLoad) {
          window.zE(type, 'hide');
        }

        root.$emit("loaded", event);

        window.zE(type + ":on", "open", () => {
          root.$emit("open");
        })

        window.zE(type + ":on", "close", () => {
          if (type === 'webWidget') {
            window.zE(type, 'hide');
          }

          root.$emit("close");
        })

        root.open = () => {
          if (type === 'webWidget') {
            window.zE(type, 'show')
          }

          window.zE(type, 'open');
        }
        root.close = () => window.zE(type, 'close');
        root.hide = () => window.zE(type, 'hide');
        root.show = () => window.zE(type, 'show');
        
        Object.defineProperty(root, "zE", {
          get: function get() {
            return window.zE;
          }
        });
  
        Vue.prototype.$zendesk = root;
      };
    };

    if (!options.disabled) {
      root.load(options.key);
    }
  }
};
