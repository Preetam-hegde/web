# Faceoff word data

- `words.txt`: the ENABLE word list (public domain), filtered to lowercase a-z words of 3-12 letters. Used to check that a typed word is real.
- `common.txt`: hand-picked everyday words, checked against `words.txt`. The 5-letter ones are Wordle Duel answers; the 7-letter ones are Anagram Race racks (each has at least 35 smaller words hiding in it).
- `frags.txt`: `fragment word-count` pairs for Word Bomb, computed from `words.txt` (2-3 letter fragments found in at least 120 words), most common first.
