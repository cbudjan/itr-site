---
# Talk date/time in UK time (Europe/London); no offset needed.
date: {{ now.Format "2006-01-02" }}T14:00:00
duration: 60                     # minutes
season: "2026-27"                # must match a key in data/seasons.yaml
title: "TBA"
status: "scheduled"              # scheduled | tba | cancelled
format: "pi"                     # pi (one talk) | junior (two short talks) | roundtable | special
speakers:
  - name: "Speaker Name"
    affiliation: "Lab, Institute, City"
    url: ""
zoom_url: ""                     # leave empty; link is emailed to subscribers
recording_url: ""                # fill after the session if a recording is shared
preprint_url: ""
draft: false
---

Abstract or short description goes here (optional).
