=== Making snapshot of phoxy

=== Installing

Add to your composer.json
```
  "config":
  {
    "bin-dir": "bin"
  },
  "scripts":
  {
    "post-package-install":
    [
      "PhantomInstaller\\Installer::installPhantomJS"
    ]
  }
```

Add to your warmup.js (or create your lazy config)

```
  OnFirstPageRendered: function()
  {
    if (typeof window.callPhantom == 'function')
      window.callPhantom('clap');
  }
```
