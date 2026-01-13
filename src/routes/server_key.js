let key = "*Ul0*v!H31%_*rd%Phigd!1O@v_Sf5wo84v@80X$v@M@2_9tw9a!O83$@M23N$GuLkc6*#O2s27T9k5JF0Lv_bve68i$a5ZLXOXÑ#;v45ñu8N44!Guy!!%$#:e0y@_I59@X@#a@@;K@ñz0r718:69:$85ñAzp:rFCÑjp0w9D858qp#%Ñ3:M435yJ*ñ*Ñ4i4h#3n2*50_92p77N*b%6W41FRpoHibk5%hX*Z2UY:R1*8_eknT039us*:_K2NAZ5vq6Lz9ñN_g:d*SnTiiSC;!5$1UqJÑ;@ñ:rA2D$m9%$62$WA77@5hb!Q%gUQQllhG@bvbZ07Qñ89$:@G31B_7;*_ECP@*%IHCjT74scK!7;dB*38PFv2SQJ3!IEmk86ÑoJ625863MH72r@BH!77E_UdJ6_2$%H;W;WMqQl3$49::F6l@1UFA*N%!s_$7*_!v_yo!_;nfgkAKd$Ff3p4F*@aña:@Ux1%943t!wWJG9!fb$ryq1O*:@pe:";

const abc = "abcdefghijklmnñopqrstuvwxyz";
setTimeout(()=>{
  setInterval(()=>{
    newKey="";
    while( newKey.length < 501 ){
      const random = Math.random();
      switch( true ){
        case random < 0.25: newKey = newKey + "!@$_%#*:;"[ Math.floor( Math.random() * 9 ) ];
        break;
        case random < 0.5: newKey = newKey + "0123456789"[ Math.floor( Math.random() * 10 ) ];
        break;
        case random < 0.75: newKey = newKey + abc[ Math.floor( Math.random() * 27 ) ].toUpperCase();
        break;
        default: newKey = newKey + abc[ Math.floor( Math.random() * 27 ) ];
      };
    };
    key = newKey;
  },86400000);
},1709874000000-Date.now());

module.exports = () => key;