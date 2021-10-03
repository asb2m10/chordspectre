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
    var ret = [ sprintf('<div class="chord" root="%s" attr="">%s',name,name)  ]
    for(var i=0;i<def.length;i++) {
        ret.push(sprintf('<div class="chordInner" root="%s" attr="%s">%s</div>', name, def[i], def[i]));
    }
    ret.push("</div>");

    ret.push(sprintf('<div class="chord" root="%s" attr="">%s',name,name))
    for(var i=0;i<def.length;i++) {
        ret.push(sprintf('<div class="chordInner" root="%s" attr="%s">%s</div>', name, def[i], def[i]));
    }
    ret.push("</div>");
    return ret.join("");
}

function loadscale(note, mode) {
    if ( mode == "major" ) {
        var target = Tonaljs.Progression.fromRomanNumerals(note, ["I", "IIm", "IIIm", "IV", "V", "VIm", "VIIm"])
        $('#top1').html(chr(target[0], ["add2", "add9"]));
        $('#top2').html(chr(target[1], ["6", "7", "9"]));
        $('#top3').html(chr(target[2], ["7"]));
        $('#top4').html(chr(target[3], ["add2", "6", "maj7", "add9", "maj79"]));
        $('#top5').html(chr(target[4], ["add2", "6", "7", "add9", "9"]));  
        $('#top6').html(chr(target[5], ["7", "9"]));
        $('#top7').html(chr(target[6], ["m7"]));

        var target = Tonaljs.Progression.fromRomanNumerals(note, ["I", "IIm", "III", "IVm", "Vm", "VIm", "VII"])
        $('#bot1').html(chr(target[0], ["7"]))
        $('#bot2').html(chr(target[1], ["dim", "dim7"]))
        $('#bot3').html(chr(target[2], ["7", "7b9", "7s9"]))
        $('#bot4').html(chr(target[3], ["6", "maj7", "m6"]))
        $('#bot5').html(chr(target[4], ["6", "7"]))
        $('#bot6').html(chr(target[5], ["7"]))
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

function playChord(root, attr) {
    var chordName = root+attr
    var chord = Tonaljs.Chord.get(chordName);

    playNotes(chord.notes);

    $("#chordName").html("<p>Playing: "+ chord + " " + chord.notes + "</p>")
    var chroma = Tonaljs.Tonal.note(chord.notes[0]).chroma
    $("#cir" + chroma).css("background-color", "red")
    for(var i=1;i<chord.notes.length;i++) {
        chroma = Tonaljs.Tonal.note(chord.notes[i]).chroma
        $("#cir" + chroma).css("background-color", "yellow")
    }
    var relative = Tonaljs.Note.transposeFifths(root,3);

}

function playNotes(notes) {
    stopNotes();
    playing = []
    for(var i=0;i<notes.length;i++) {
        playing.push(notes[i] + "4")
        sinkmidi.playNote(playing[i], 1);
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

    if (!e) var e = window.event;
    e.cancelBubble = true;
    if (e.stopPropagation) e.stopPropagation();
    playChord($(this).attr('root'),$(this).attr('attr'));
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
