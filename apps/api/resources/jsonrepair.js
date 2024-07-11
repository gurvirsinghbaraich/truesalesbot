!(function (t, e) {
  "object" == typeof exports && "undefined" != typeof module
    ? e(exports)
    : "function" == typeof define && define.amd
      ? define(["exports"], e)
      : e(
          ((t =
            "undefined" != typeof globalThis
              ? globalThis
              : t || self).JSONRepair = {})
        );
})(this, function (t) {
  "use strict";
  class x extends Error {
    constructor(t, e) {
      super(t + " at position " + e), (this.position = e);
    }
  }
  const h = 125,
    e = 32,
    y = 10,
    O = 9,
    N = 13,
    J = 8,
    S = 12,
    j = 34,
    r = 39,
    $ = 48,
    k = 57,
    d = 44,
    m = 65,
    I = 97,
    T = 70,
    E = 102,
    l = 160,
    R = 8192,
    U = 8202,
    F = 8239,
    q = 8287,
    z = 12288,
    n = 8220,
    o = 8221,
    c = 8216,
    i = 8217,
    f = 96,
    a = 180;
  function B(t) {
    return t >= $ && t <= k;
  }
  function D(t) {
    return u.test(t);
  }
  const u = /^[,:[\]/{}()\n+]$/;
  function G(t) {
    return s.test(t) || (t && K(t.charCodeAt(0)));
  }
  const s = /^[[{\w-]$/;
  function H(t) {
    return t === e || t === y || t === O || t === N;
  }
  function K(t) {
    return L(t) || P(t);
  }
  function L(t) {
    return t === j || t === n || t === o;
  }
  function M(t) {
    return t === j;
  }
  function P(t) {
    return t === r || t === c || t === i || t === f || t === a;
  }
  function Q(t) {
    return t === r;
  }
  function V(t, e, r) {
    (r = 2 < arguments.length && void 0 !== r && r), (e = t.lastIndexOf(e));
    return -1 !== e ? t.substring(0, e) + (r ? "" : t.substring(e + 1)) : t;
  }
  function W(t, e) {
    let r = t.length;
    if (!H(t.charCodeAt(r - 1))) return t + e;
    for (; H(t.charCodeAt(r - 1)); ) r--;
    return t.substring(0, r) + e + t.substring(r);
  }
  const X = { "\b": "\\b", "\f": "\\f", "\n": "\\n", "\r": "\\r", "\t": "\\t" },
    Y = {
      '"': '"',
      "\\": "\\",
      "/": "/",
      b: "\b",
      f: "\f",
      n: "\n",
      r: "\r",
      t: "\t",
    };
  (t.JSONRepairError = x),
    (t.jsonrepair = function (s) {
      let A = 0,
        C = "";
      if (!c()) throw new x("Unexpected end of json string", s.length);
      var t = i(d);
      if ((t && g(), G(s[A]) && /[,\n][ \t\r]*$/.test(C))) {
        t || (C = W(C, ","));
        {
          let t = !0,
            e = !0;
          for (; e; ) t ? (t = !1) : i(d) || (C = W(C, ",")), (e = c());
          e || (C = V(C, ","));
          C = "[\n".concat(C, "\n]");
        }
      } else t && (C = V(C, ","));
      for (; s.charCodeAt(A) === h || 93 === s.charCodeAt(A); ) A++, g();
      if (A >= s.length) return C;
      throw new x("Unexpected character " + JSON.stringify(s[A]), A);
      function c() {
        g();
        var t =
          (function () {
            if (123 !== s.charCodeAt(A)) return !1;
            {
              (C += "{"), A++, g(), v(d) && g();
              let e = !0;
              for (; A < s.length && s.charCodeAt(A) !== h; ) {
                let t;
                if (
                  (e
                    ? ((t = !0), (e = !1))
                    : ((t = i(d)) || (C = W(C, ",")), g()),
                  f(),
                  !(b() || a()))
                ) {
                  s.charCodeAt(A) === h ||
                  123 === s.charCodeAt(A) ||
                  93 === s.charCodeAt(A) ||
                  91 === s.charCodeAt(A) ||
                  void 0 === s[A]
                    ? (C = V(C, ","))
                    : (function () {
                        throw new x("Object key expected", A);
                      })();
                  break;
                }
                g();
                var r = i(58),
                  n = A >= s.length,
                  o = (r || (G(s[A]) || n ? (C = W(C, ":")) : u()), c());
                o || (r || n ? (C += "null") : u());
              }
              return (
                s.charCodeAt(A) === h ? ((C += "}"), A++) : (C = W(C, "}")), !0
              );
            }
          })() ||
          (function () {
            if (91 !== s.charCodeAt(A)) return !1;
            {
              (C += "["), A++, g(), v(d) && g();
              let t = !0;
              for (; A < s.length && 93 !== s.charCodeAt(A); ) {
                t ? (t = !1) : i(d) || (C = W(C, ",")), f();
                var e = c();
                if (!e) {
                  C = V(C, ",");
                  break;
                }
              }
              return (
                93 === s.charCodeAt(A) ? ((C += "]"), A++) : (C = W(C, "]")), !0
              );
            }
          })() ||
          b() ||
          (function () {
            var t = A;
            if (45 === s.charCodeAt(A)) {
              if ((A++, n())) return o(t), !0;
              if (!B(s.charCodeAt(A))) return (A = t), !1;
            }
            for (; B(s.charCodeAt(A)); ) A++;
            if (46 === s.charCodeAt(A)) {
              if ((A++, n())) return o(t), !0;
              if (!B(s.charCodeAt(A))) return (A = t), !1;
              for (; B(s.charCodeAt(A)); ) A++;
            }
            if (101 === s.charCodeAt(A) || 69 === s.charCodeAt(A)) {
              if (
                (A++,
                (45 !== s.charCodeAt(A) && 43 !== s.charCodeAt(A)) || A++,
                n())
              )
                return o(t), !0;
              if (!B(s.charCodeAt(A))) return (A = t), !1;
              for (; B(s.charCodeAt(A)); ) A++;
            }
            var e, r;
            if (n()) {
              if (A > t)
                return (
                  (e = s.slice(t, A)),
                  (r = /^0\d/.test(e)),
                  (C += r ? '"'.concat(e, '"') : e),
                  !0
                );
            } else A = t;
            return !1;
          })() ||
          r("true", "true") ||
          r("false", "false") ||
          r("null", "null") ||
          r("True", "true") ||
          r("False", "false") ||
          r("None", "null") ||
          a();
        return g(), t;
      }
      function g() {
        A;
        let t = e();
        for (
          ;
          (t =
            (t = (function () {
              if (47 === s.charCodeAt(A) && 42 === s.charCodeAt(A + 1)) {
                for (
                  ;
                  A < s.length &&
                  !(function (t, e) {
                    return "*" === t[e] && "/" === t[e + 1];
                  })(s, A);

                )
                  A++;
                A += 2;
              } else {
                if (47 !== s.charCodeAt(A) || 47 !== s.charCodeAt(A + 1))
                  return !1;
                for (; A < s.length && s.charCodeAt(A) !== y; ) A++;
              }
              return !0;
            })()) && e());

        );
        A;
      }
      function e() {
        let t = "";
        for (
          var e, r;
          (e = H(s.charCodeAt(A))) ||
          (r = s.charCodeAt(A)) === l ||
          (r >= R && r <= U) ||
          r === F ||
          r === q ||
          r === z;

        )
          (t += e ? s[A] : " "), A++;
        return 0 < t.length && ((C += t), !0);
      }
      function i(t) {
        return s.charCodeAt(A) === t && ((C += s[A]), A++, !0);
      }
      function v(t) {
        return s.charCodeAt(A) === t && (A++, !0);
      }
      function f() {
        g(),
          46 === s.charCodeAt(A) &&
            46 === s.charCodeAt(A + 1) &&
            46 === s.charCodeAt(A + 2) &&
            ((A += 3), g(), v(d));
      }
      function b(t) {
        var r,
          n,
          o = 0 < arguments.length && void 0 !== t && t;
        let c = 92 === s.charCodeAt(A);
        if ((c && (A++, (c = !0)), K(s.charCodeAt(A)))) {
          var i = M(s.charCodeAt(A))
              ? M
              : Q(s.charCodeAt(A))
                ? Q
                : P(s.charCodeAt(A))
                  ? P
                  : L,
            f = A,
            a = C.length;
          let e = '"';
          for (A++; ; ) {
            if (A >= s.length)
              return (
                (u = w(A - 1)),
                !o && D(s.charAt(u))
                  ? ((A = f), (C = C.substring(0, a)), b(!0))
                  : ((e = W(e, '"')), (C += e), !0)
              );
            if (i(s.charCodeAt(A))) {
              var u = A,
                h = e.length;
              if (
                ((e += '"'),
                A++,
                (C += e),
                g(),
                o ||
                  A >= s.length ||
                  D(s.charAt(A)) ||
                  K(s.charCodeAt(A)) ||
                  B(s.charCodeAt(A)))
              )
                return p(), !0;
              if (D(s.charAt(w(u - 1))))
                return (A = f), (C = C.substring(0, a)), b(!0);
              (C = C.substring(0, a)),
                (A = u + 1),
                (e = e.substring(0, h) + "\\" + e.substring(h));
            } else {
              if (o && D(s[A])) return (e = W(e, '"')), (C += e), p(), !0;
              if (92 === s.charCodeAt(A)) {
                h = s.charAt(A + 1);
                if (void 0 !== Y[h]) (e += s.slice(A, A + 2)), (A += 2);
                else if ("u" === h) {
                  let t = 2;
                  for (
                    ;
                    t < 6 &&
                    (((n = s.charCodeAt(A + t)) >= $ && n <= k) ||
                      (n >= m && n <= T) ||
                      (n >= I && n <= E));

                  )
                    t++;
                  if (6 === t) (e += s.slice(A, A + 6)), (A += 6);
                  else {
                    if (!(A + t >= s.length))
                      throw (
                        ((d = void 0),
                        (d = s.slice(A, A + 6)),
                        new x('Invalid unicode character "'.concat(d, '"'), A))
                      );
                    A = s.length;
                  }
                } else (e += h), (A += 2);
              } else {
                var d = s.charAt(A),
                  l = s.charCodeAt(A);
                if (l === j && 92 !== s.charCodeAt(A - 1)) e += "\\" + d;
                else if (
                  (r = l) === y ||
                  r === N ||
                  r === O ||
                  r === J ||
                  r === S
                )
                  e += X[d];
                else {
                  if (!(32 <= (r = l) && r <= 1114111))
                    throw (
                      ((l = void 0),
                      (l = d),
                      new x("Invalid character " + JSON.stringify(l), A))
                    );
                  e += d;
                }
                A++;
              }
            }
            c && v(92);
          }
        }
        return !1;
      }
      function p() {
        let t = !1;
        for (g(); 43 === s.charCodeAt(A); ) {
          (t = !0), A++, g();
          var e = (C = V(C, '"', !0)).length,
            r = b();
          C = r
            ? ((r = C),
              (e = e),
              (n = 1),
              r.substring(0, e) + r.substring(e + n))
            : W(C, '"');
        }
        var n;
        t;
      }
      function r(t, e) {
        return (
          s.slice(A, A + t.length) === t && ((C += e), (A += t.length), !0)
        );
      }
      function a() {
        for (
          var t, e = A;
          A < s.length && (!D((t = s[A])) || "/" === t) && !K(s.charCodeAt(A));

        )
          A++;
        if (A > e) {
          if (40 === s.charCodeAt(A) && /^\w+$/.test(s.slice(e, A).trim()))
            A++,
              c(),
              41 === s.charCodeAt(A) && (A++, 59 === s.charCodeAt(A)) && A++;
          else {
            for (; H(s.charCodeAt(A - 1)) && 0 < A; ) A--;
            e = s.slice(e, A);
            (C += "undefined" === e ? "null" : JSON.stringify(e)),
              s.charCodeAt(A) === j && A++;
          }
          return !0;
        }
      }
      function w(t) {
        let e = t;
        for (; 0 < e && H(s.charCodeAt(e)); ) e--;
        return e;
      }
      function n() {
        return A >= s.length || D(s[A]) || H(s.charCodeAt(A));
      }
      function o(t) {
        C += s.slice(t, A) + "0";
      }
      function u() {
        throw new x("Colon expected", A);
      }
    });
});
