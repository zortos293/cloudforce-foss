from pyconsole.shell import Shell

class TestShell(Shell):
    def processLine(self, line):
        return iter(())

if __name__ == '__main__':
    s = TestShell(output=False, echo=False)
    for c in "1\n2\n3\n4\n5\n":
        s._processChar(c)
    for i, c in enumerate("12345"):
        assert s._history[i] == c
        print "History test passed, i = %d, c = %s :)" % (i, c) 

    for i, c in enumerate("54321"):
        s._processChar(chr(27))
        s._processChar(chr(91))
        s._processChar(chr(65))
        assert s._histIdx == 4 - i
        assert s._chars == [c]
    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(65))
    assert s._histIdx == 0
    assert s._chars == ['1']
    print "Up arrow key tests passed :)"

    for i, c in enumerate("12345"):
        assert s._histIdx == i
        assert s._chars == [c]
        s._processChar(chr(27))
        s._processChar(chr(91))
        s._processChar(chr(66))
    assert s._histIdx == 4
    assert s._chars == ['5']
    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(66))
    assert s._histIdx == 4
    assert s._chars == ['5']
    print "Down arrow key tests passed :)"

    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(68))
    s._processChar('0')
    assert s._chars == ['0', '5']
    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(68))
    s._processChar('1')
    assert s._chars == ['1', '0', '5']
    s._processChar('1')
    s._processChar('1')
    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(68))
    s._processChar('0')
    assert s._chars == ['1', '1', '0', '1', '0', '5']
    print "Left arrow key tests passed :)"

    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(67))
    s._processChar('0')
    assert s._chars == ['1', '1', '0', '1', '0', '0', '5']
    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(67))
    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(67))
    s._processChar('0')
    assert s._chars == ['1', '1', '0', '1', '0', '0', '5', '0']
    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(67))
    s._processChar('0')
    assert s._chars == ['1', '1', '0', '1', '0', '0', '5', '0', '0']
    print "Right arrow key tests passed :)"

    s._processChar('\b')
    assert s._chars == ['1', '1', '0', '1', '0', '0', '5', '0']
    s._processChar('\b')
    assert s._chars == ['1', '1', '0', '1', '0', '0', '5']
    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(68))
    s._processChar('\b')
    s._processChar('\b')
    assert s._chars == ['1', '1', '0', '1', '5']
    s._processChar('\b')
    s._processChar('\b')
    s._processChar('\b')
    s._processChar('\b')
    assert s._chars == ['5']
    s._processChar('\b')
    assert s._chars == ['5']
    print "Backspace tests passed :)"

    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(51))
    s._processChar(chr(126))
    assert s._chars == []
    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(51))
    s._processChar(chr(126))
    assert s._chars == []
    print "Delete tests passed :)"
    
    s._processChar("a")
    s._processChar("b")
    s._processChar("c")
    s._processChar("d")
    s._processChar("e")
    s._processChar("\n")
    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(65))
    assert s._chars == ['a', 'b', 'c', 'd', 'e']
    assert s._cursor == 5
    s._processChar(chr(27))
    s._processChar(chr(91))
    s._processChar(chr(68))
    assert s._cursor == 4
    print "All tests passed :)"
