import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css' // Import precompiled Bootstrap css
import WebMidi from 'webmidi'
import * as Tonaljs from "@tonaljs/modules"
import $ from 'jquery'
import { sprintf } from 'sprintf-js'

var midiOutputs = null;
var sinkmidi = null;
var playing = [];

function chr(name, def) {
    let ret = "" + sprintf('<div class="chord" root="%s" attr="">%s',name,name);

    if ( typeof def != "undefined") {
        for(var i=0;i<def.length;i++) {
            ret += sprintf('<div class="chordInner" root="%s" attr="%s">%s</div>', name, def[i], def[i])
        }
    }
    ret += "</div>"
    return ret

}

function loadscale(note, mode) {
    if ( mode == "major" ) {
        var target = Tonaljs.Progression.fromRomanNumerals(note, ["I", "IIm", "IIIm", "IV", "V", "VIm", "VIIm"])
        let modes = ""
        
        // 1
        modes += chr(target[0]+"m")
        modes += chr(target[0]+"sus2")
        modes += chr(target[0]+"sus4")
        modes += chr(target[0], ["add2", "add9"])
        $('#top1').html(modes);

        // 2
        modes = ""
        modes += chr(Tonaljs.Note.simplify(Tonaljs.Note.transpose(target[0], "1A")), []);
        modes += chr(target[1][0] + "sus4")
        modes += chr(target[1][0] + "sus2")
        modes += chr(target[1], ["6", "7", "9"])

        $('#top2').html(modes);
        
        // 3
        modes = ""
        modes += chr(target[1][0] + "sus4")
        modes += chr(target[2], ["7"])
        $('#top3').html(modes);
        
        // 4
        modes = ""
        modes += chr(target[3], ["add2", "6", "maj7", "add9", "maj79"])
        modes += chr(target[3] + "sus2")
        $('#top4').html(modes);
        
        // 5
        modes = ""
        modes += chr(target[4], ["add2", "6", "7", "add9", "9"])
        modes += chr(target[4] + "sus4")
        $('#top5').html(modes);
        
        // 6
        $('#top6').html(chr(target[5], ["7", "9"]));
        
        // 7
        $('#top7').html(chr(target[6], ["m7"]));

        var target = Tonaljs.Progression.fromRomanNumerals(note, ["I", "IIm", "III", "IVm", "Vm", "VIm", "VII"])
        $('#bot1').html(chr(target[0], ["7"]))
        $('#bot2').html(chr(target[1], ["dim", "dim7"]))
        $('#bot3').html(chr(target[2], ["7", "7b9", "7s9"]))
        $('#bot4').html(chr(target[3], ["6", "maj7", "m6"]))
        $('#bot5').html(chr(target[4], ["6", "7"]))
        //$('#bot6').html(chr(target[5], ["7"]))
        $('#bot7').html(chr(target[6], ["7"]))
    } else {

    }

    // re-register the chords 
    $(".chordInner").on('click', handleNoteClick);
    $(".chord").on('click', handleNoteClick);  
}

function prepareMidi() {
    WebMidi.enable(function (err) {
        if (err) {
          console.log("WebMidi could not be enabled.", err);
        }
    
        var midiout = $('#midiout');
        $.each(WebMidi.outputs, function(key, value) {
            console.log(WebMidi.outputs[key])
            midiout.append(new Option(WebMidi.outputs[key].name));
        });

        midiOutputs = WebMidi.outputs;
        sinkmidi = WebMidi.outputs[0];
        midiout.on('change', function() { 
            panic();
            sinkmidi = midiOutputs[$(this)['0'].selectedIndex]
        });
    });

    $("#panic").on('click', panic);
    $("#stopNotes").on('click', stopNotes);
}

function panic() {
    for(var i=0;i<127;i++) {
        sinkmidi.stopNote(i, 1);
    }
}

function playChord(root, attr, filters) {
    var chordName = root+attr
    var chord = Tonaljs.Chord.get(chordName);

    playNotes(chord.notes, filters);

    $("#chordName").html("<p>Playing: "+ chord.name + " (" + chord.notes + ")</p>")
    var chroma = Tonaljs.Tonal.note(chord.notes[0]).chroma
    $("#cir" + chroma).css("background-color", "red")
    for(var i=1;i<chord.notes.length;i++) {
        chroma = Tonaljs.Tonal.note(chord.notes[i]).chroma
        $("#cir" + chroma).css("background-color", "yellow")
    }
    var relative = Tonaljs.Note.transposeFifths(root,3);

}

function playNotes(notes, filters) {
    stopNotes();
    playing = []
    for(var i=0;i<notes.length;i++) {
        if ( i != filters ) {
            note = notes[i] + "4"
            playing.push(note)
            sinkmidi.playNote(note, 1);
        }
    }
}

function stopNotes() {
    $(".circle-note").css("background-color", "#bbb")
    for(var i=0;i<playing.length;i++)
        sinkmidi.stopNote(playing[i], 1);
    $("#chordName").html("<p>Playing: silence</p>");
}

function handleNoteClick(event) {
    // The code below is to avoid the top div (.chord) to respond to the 
    // click event if an inner chord is called

    console.log(event)

    let filters;
    if (event.altKey && event.ctrlKey) {
        filters = 0
    } else if (event.altKey) {
        filters = 1
    } else if (event.ctrlKey) {
        filters = 2
    }

    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    playChord($(this).attr('root'),$(this).attr('attr'), filters);
}

function circleKeyChange(event) {
    var key = event.target.innerText
    if ( key.endsWith("m")) {
        key = key.substring(0, key.length - 1);
        loadscale(key, "major")
    } else {
        loadscale(key, "major")
    }
}

$(document).ready ( function () {
    prepareMidi();
    $(".circle-container").on('click', circleKeyChange);
    loadscale("C", "major");
});
